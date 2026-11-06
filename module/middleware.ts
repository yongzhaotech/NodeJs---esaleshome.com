'use strict';
import type { NextFunction, Request, Response } from 'express';
import { sign, verify, JwtPayload, decode } from 'jsonwebtoken';
import { mysql as sql, QueryResponse } from '../utils';
import { jwtConfig, AUTH_STATUS, AuthStatus } from '../constants';

const LANG_LABELS = require('../js/language').label(),
	content = require('../js/static-content'),
	session = require('./session'),
	origins = {
		'http://www.esaleshome.com': true,
		'http://esaleshome.com': true,
		'www.esaleshome.com': true,
		'esaleshome.com': true,
		'http://localhost:3000': true,
		'http://192.168.2.32:3000': true
	};

type Language = 'en' | 'cn';

interface MiddlewareRequest extends Request {
	cookies: {
		session_id?: string;
		lang?: string;
		'access-token'?: string;
		'refresh-token'?: string;
	};
	body: Record<string, string | undefined>;
}

interface SessionUser {
	id: string | number;
	access_level: string | number;
}

interface AuthorizationRule {
	access_level: string | number;
	check_ad?: boolean;
}

interface AdOwnerRow {
	user_id: string | number;
}

interface SelectResponse {
	data?: AdOwnerRow[];
	error?: unknown;
}

const getLanguage = (language?: string): Language => language === 'cn' ? 'cn' : 'en';

const getSessionUser = (user: unknown): SessionUser | null => {
	if (user && typeof user === 'object' && 'id' in user && 'access_level' in user) {
		const sessionUser = user as Record<string, unknown>;
		if ((typeof sessionUser.id === 'string' || typeof sessionUser.id === 'number') &&
			(typeof sessionUser.access_level === 'string' || typeof sessionUser.access_level === 'number')) {
			return { id: sessionUser.id, access_level: sessionUser.access_level };
		}
	}
	return null;
};

const refreshAccessToken = async (req: MiddlewareRequest, res: Response): Promise<AuthStatus> => {
	// access token cookie in user's browser might have expired or been deleted, so we detect if the refresh token is still valid and issue a new access token if it is
	const refreshToken = req.cookies['refresh-token'];
	if (refreshToken) {
		try {
			const { data = [] } = await sql.executeQuery('select', 'refresh_tokens', { id: refreshToken });
			if (data.length === 0) {
				// refresh token not found in the db

				return Promise.reject(AUTH_STATUS.INVALID_TOKEN);
			}
			const decodedRefresh = verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;
			const ext = decodedRefresh.exp as number;
			if (Date.now() >= ext * 1000) {
				// refresh token expires
				return Promise.reject(AUTH_STATUS.TOKEN_EXPIRED);
			}
			const userPayload = { userId: decodedRefresh.userId, email: decodedRefresh.email, access_level: decodedRefresh.access_level };
			const newAccessToken = sign(
				userPayload,
				jwtConfig.secret,
				{ expiresIn: jwtConfig.accessTokenExpiresIn }
			);

			// Overwrite the old access-token cookie
			res.cookie('access-token', newAccessToken, { ...jwtConfig.COOKIE_OPTIONS, maxAge: jwtConfig.accessTokenMaxAge });
			return Promise.resolve(AUTH_STATUS.OK);
		} catch (error) {
			// refresh token error captured
			return Promise.reject(AUTH_STATUS.INVALID_TOKEN);
		}
	}
	// If no refresh token is present, inform the caller that authentication is required
	return Promise.reject(AUTH_STATUS.AUTH_REQUIRED);
};

const checkSession = async (req: MiddlewareRequest, res: Response): Promise<AuthStatus> => {
	const accessToken = req.cookies['access-token'];
	if (accessToken) {
		try {
			const decoded = verify(accessToken, jwtConfig.secret) as JwtPayload;
			const exp = decoded.exp as number;
			if (Date.now() >= exp * 1000) {
				// access token expires, try to refresh
				return await refreshAccessToken(req, res);
			}
			return Promise.resolve(AUTH_STATUS.OK);
		} catch (error) {
			// If the token is invalid, e.g. user tampers their own httpOnly cookie, try to refresh
			return await refreshAccessToken(req, res);
		}

	} else {
		// access token cookie in user's browser might have expired or been deleted, so we detect if the refresh token is still valid and issue a new access token if it is
		return await refreshAccessToken(req, res);
	}
};

const checkPermission = (req: MiddlewareRequest, res: Response, next: NextFunction): void => {
	const page = req.path.replace(/^\//, ""),
		lang = getLanguage(req.cookies.lang),
		auth = content.get('site_authenticate') as Record<string, AuthorizationRule>;

	if (auth[page]) {
		// checkSession already validated/refreshed the token, it is safe to decode without verifying
		const accessToken = req.cookies['access-token'] as string;
		const { access_level, userId } = (decode(accessToken) as JwtPayload & { access_level?: string; userId?: string }) ?? {};

		if (access_level && userId) {
			if (+access_level < +auth[page].access_level) {
				res.send({ error: LANG_LABELS.no_permission[lang] });
			} else if (auth[page].check_ad) {
				Promise.resolve(sql.executeQuery('select user_id from advertise where id = ?', [req.body.aid || req.body.advertise_id || '']))
					.then((result: unknown) => {
						const promise = result as SelectResponse;
						let ad = promise.data && promise.data[0] || null;
						if (ad === null) {
							res.send({ error: LANG_LABELS.no_such_post[lang] });
						} else if (+ad.user_id !== +userId) {
							res.send({ error: LANG_LABELS.not_your_post[lang] });
						} else {
							next();
						}
					}).catch(() => {
						res.send({ error: LANG_LABELS.unknown_error[lang] });
						return;
					});
			} else {
				next();
			}
		} else {
			res.send({ sessionExpire: LANG_LABELS.not_sign_in[lang] });
			return;
		}
	} else {
		next();
	}
};

const accessControl = async (req: MiddlewareRequest, res: Response, next: NextFunction) => {
	let origin = req.get('origin');
	res.append('Access-Control-Allow-Credentials', String(true));
	if (origin && origin.toLowerCase() in origins) {
		res.append('Access-Control-Allow-Origin', origin);
	}
	if (!req.cookies.lang) { res.cookie('lang', 'en'); }
	if (req.method === 'OPTIONS') { res.end(); return; }

	try {
		const result = await checkSession(req, res);
		if (result === AUTH_STATUS.OK) {
			res.cookie('user_is_signed_in', 1);
		}
	} catch (error) {
		res.clearCookie('user_is_signed_in');
	} finally {
		next();
	}
};

exports.accessControl = accessControl;
exports.checkPermission = checkPermission;
