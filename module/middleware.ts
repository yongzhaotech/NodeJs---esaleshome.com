'use strict';
import type { NextFunction, Request, Response } from 'express';

const LANG_LABELS = require('../js/language').label(),
	content = require('../js/static-content'),
	session = require('./session'),
	sql = require('./sql-engine'),
	origins = {
		'http://www.esaleshome.com': true,
		'http://esaleshome.com': true,
		'www.esaleshome.com': true,
		'esaleshome.com': true,
		'http://localhost:3000': true,
		'http://192.168.0.149:3000': true
	};

type Language = 'en' | 'cn';

interface MiddlewareRequest extends Request {
	cookies: {
		session_id?: string;
		lang?: string;
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
	if(user && typeof user === 'object' && 'id' in user && 'access_level' in user) {
		const sessionUser = user as Record<string, unknown>;
		if((typeof sessionUser.id === 'string' || typeof sessionUser.id === 'number') &&
			(typeof sessionUser.access_level === 'string' || typeof sessionUser.access_level === 'number')) {
			return {id: sessionUser.id, access_level: sessionUser.access_level};
		}
	}
	return null;
};
		
const checkSession = (req: MiddlewareRequest, res: Response): Promise<number> => {
	if(session.exist(req.cookies.session_id)) {
		return new Promise((resolve, reject) => {
			if(session.expire(req.cookies.session_id)) {
				session.remove(req.cookies.session_id).then(() => {
					res.clearCookie('session_id');
					res.clearCookie('user_is_signed_in');
					resolve(1);
				}).catch(() => {
					reject(1);
				});
			}else {
				session.update(req.cookies.session_id).then(() => {
					resolve(1);
				}).catch(() => {
					reject(1);
				});
			}
		});
	}else {
		return Promise.resolve(1);
	}	
};	
		
const accessControl = (req: MiddlewareRequest, res: Response, next: NextFunction): void => {
	let origin = req.get('origin');
	res.append('Access-Control-Allow-Credentials', String(true));
	if(origin && origin.toLowerCase() in origins) {
		res.append('Access-Control-Allow-Origin', origin);
	}
	if(!req.cookies.lang) { res.cookie('lang', 'en'); }
	if(req.method === 'OPTIONS') { res.end(); return; }
	checkSession(req, res).then(() => {
		next();
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[getLanguage(req.cookies.lang)]});
	});
};

const checkPermission = (req: MiddlewareRequest, res: Response, next: NextFunction): void => {
	let page = req.path.replace(/^\//, ""),
		lang = getLanguage(req.cookies.lang),
		auth = content.get('site_authenticate') as Record<string, AuthorizationRule>,
		user = session.exist(req.cookies.session_id) ? getSessionUser(session.get(req.cookies.session_id as string, 'user')) : null;

	if(auth[page]) {
		if(user) {
			if(+user.access_level < +auth[page].access_level) {
				res.send({error: LANG_LABELS.no_permission[lang]});
			}else if(auth[page].check_ad) {
				Promise.resolve(sql.executeQuery('select user_id from advertise where id = ?', [req.body.aid || req.body.advertise_id || '']))
				.then((result: unknown) => {
					const promise = result as SelectResponse;
					let ad = promise.data && promise.data[0] || null;
					if(ad === null) {
						res.send({error: LANG_LABELS.no_such_post[lang]});
					}else if(+ad.user_id !== +user.id){
						res.send({error: LANG_LABELS.not_your_post[lang]});
					}else {
						next();
					}					
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
					return;
				});				
			}else {
				next();
			}
		}else {
			res.send({sessionExpire: LANG_LABELS.not_sign_in[lang]});
		}
	}else {
		next();
	}
};

exports.accessControl = accessControl;
exports.checkPermission = checkPermission;
