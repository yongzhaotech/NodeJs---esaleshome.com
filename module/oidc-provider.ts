import { createHash, generateKeyPairSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { Router, urlencoded, type Request, type Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { mysql as sql, type QueryResponse } from '../utils';
import { verifyPassword } from '../utils/password';

// Local-only learning provider: one SPA client, in-memory codes, and an ephemeral signing key.

interface Account {
	id: number | string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	active: number | string;
}

interface AuthorizationRequest {
	clientId: string;
	redirectUri: string;
	scope: string;
	state: string;
	nonce?: string;
	codeChallenge: string;
}

interface AuthorizationCodeRecord {
	code: string;
	user_id: number | string;
	client_id: string;
	redirect_uri: string;
	code_challenge: string;
	code_challenge_method: string;
	scope: string;
	nonce: string | null;
}

const issuer = 'http://localhost:88';
const clientId = 'esales_home_learning';
const redirectUris = new Set(['http://localhost:3000/ads/dashboard']);
const supportedScopes = new Set(['openid', 'profile', 'email', 'api.read']);
const accessTokenAudience = 'esaleshome-api';
const authorizationCodeLifetimeMs = 60_000;
const accessTokenLifetimeSeconds = 15 * 60;
const expressUrlEncoded = urlencoded({ extended: false });
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const signingKeyId = randomBytes(12).toString('base64url');
const publicJwk = publicKey.export({ format: 'jwk' });

const router = Router();

const getSingleValue = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;

const parseAuthorizationRequest = (input: Record<string, unknown>): { request?: AuthorizationRequest; error?: string } => {
	const requestClientId = getSingleValue(input.client_id);
	const redirectUri = getSingleValue(input.redirect_uri);
	if (requestClientId !== clientId || !redirectUri || !redirectUris.has(redirectUri)) {
		return { error: 'invalid_client' };
	}

	const responseType = getSingleValue(input.response_type);
	const scope = getSingleValue(input.scope) || '';
	const state = getSingleValue(input.state);
	const nonce = getSingleValue(input.nonce);
	const codeChallenge = getSingleValue(input.code_challenge);
	const codeChallengeMethod = getSingleValue(input.code_challenge_method);
	const requestedScopes = scope.split(/\s+/).filter(Boolean);

	if (
		responseType !== 'code' ||
		!requestedScopes.includes('openid') ||
		requestedScopes.some(requestedScope => !supportedScopes.has(requestedScope)) ||
		!state || state.length > 512 ||
		(nonce !== undefined && nonce.length > 512) ||
		!codeChallenge || !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge) ||
		codeChallengeMethod !== 'S256'
	) {
		return { error: 'invalid_request' };
	}

	return {
		request: {
			clientId: requestClientId,
			redirectUri,
			scope: requestedScopes.join(' '),
			state,
			nonce,
			codeChallenge
		}
	};
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
}[character] as string));

const renderLogin = (res: Response, request: AuthorizationRequest, errorMessage = ''): void => {
	const hiddenFields = [
		['client_id', request.clientId],
		['redirect_uri', request.redirectUri],
		['response_type', 'code'],
		['scope', request.scope],
		['state', request.state],
		['nonce', request.nonce || ''],
		['code_challenge', request.codeChallenge],
		['code_challenge_method', 'S256']
	].map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`).join('');

	res.set({
		'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self' http://localhost:88 http://localhost:3000; base-uri 'none'; frame-ancestors 'none'",
		'X-Content-Type-Options': 'nosniff',
		'Cache-Control': 'no-store'
	}).status(errorMessage ? 401 : 200).type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Local OIDC sign in</title></head>
<body style="font:16px sans-serif;max-width:28rem;margin:3rem auto;padding:0 1rem">
	<h1>Sign in to esaleshome learning</h1>
	<p>This local demo authorization server is asking you to sign in.</p>
	<p>The configured local client is pre-approved for: <code>${escapeHtml(request.scope)}</code></p>
	${errorMessage ? `<p role="alert">${escapeHtml(errorMessage)}</p>` : ''}
	<form method="post" action="/authorize">
		${hiddenFields}
		<p><label>Email<br><input name="email" type="email" autocomplete="username" required></label></p>
		<p><label>Password<br><input name="password" type="password" autocomplete="current-password" required></label></p>
		<button type="submit">Sign in and authorize</button>
	</form>
</body>
</html>`);
};

router.get('/.well-known/openid-configuration', (_req, res) => {
	res.set('Cache-Control', 'no-store').json({
		issuer,
		authorization_endpoint: `${issuer}/authorize`,
		token_endpoint: `${issuer}/token`,
		userinfo_endpoint: `${issuer}/userinfo`,
		jwks_uri: `${issuer}/jwks`,
		response_types_supported: ['code'],
		response_modes_supported: ['query'],
		grant_types_supported: ['authorization_code'],
		subject_types_supported: ['public'],
		id_token_signing_alg_values_supported: ['RS256'],
		token_endpoint_auth_methods_supported: ['none'],
		scopes_supported: [...supportedScopes],
		code_challenge_methods_supported: ['S256'],
		claims_supported: ['sub', 'email', 'email_verified', 'name', 'given_name', 'family_name']
	});
});

router.get('/jwks', (_req, res) => {
	res.set('Cache-Control', 'no-store').json({
		keys: [{ ...publicJwk, kid: signingKeyId, use: 'sig', alg: 'RS256' }]
	});
});

router.get('/authorize', (req, res) => {
	const parsed = parseAuthorizationRequest(req.query as Record<string, unknown>);
	if (!parsed.request) {
		return res.status(400).json({ error: parsed.error });
	}
	return renderLogin(res, parsed.request);
});

router.post('/authorize', expressUrlEncoded, async (req: Request, res: Response) => {
	const parsed = parseAuthorizationRequest(req.body as Record<string, unknown>);
	if (!parsed.request) {
		return res.status(400).send('Invalid authorization request');
	}

	const request = parsed.request;
	const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
	const password = typeof req.body.password === 'string' ? req.body.password : '';
	if (!email || !password) {
		return renderLogin(res, request, 'Enter your email and password.');
	}

	try {
		const result = await sql.executeQuery('select', 'user', { email }) as QueryResponse;
		const account = (result.data && result.data[0]) as Account | undefined;
		if (!account || Number(account.active) !== 1 || !account.password || !(await verifyPassword(password, account.password))) {
			return renderLogin(res, request, 'Email or password is incorrect.');
		}

		const code = randomBytes(32).toString('base64url');
		const storedCode = createHash('sha256').update(code, 'ascii').digest('hex');
		const cleanup = await sql.executeStmt('delete from authorization_codes where used = 1 or expires_at <= UTC_TIMESTAMP()');
		if (cleanup.error) {
			return renderLogin(res, request, 'Sign in could not be completed. Please try again.');
		}
		const stored = await sql.executeStmt(
			`insert into authorization_codes
				(code, user_id, client_id, redirect_uri, code_challenge, code_challenge_method, scope, nonce, expires_at, used)
			 values (?, ?, ?, ?, ?, 'S256', ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 60 SECOND), 0)`,
			[storedCode, account.id, request.clientId, request.redirectUri, request.codeChallenge, request.scope, request.nonce || null]
		);
		if (stored.error) {
			return renderLogin(res, request, 'Sign in could not be completed. Please try again.');
		}

		const callback = new URL(request.redirectUri);
		callback.searchParams.set('code', code);
		callback.searchParams.set('state', request.state);
		return res.redirect(303, callback.toString());
	} catch {
		return renderLogin(res, request, 'Sign in could not be completed. Please try again.');
	}
});

router.post('/token', expressUrlEncoded, async (req: Request, res: Response) => {
	res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
	const { grant_type: grantType, code, redirect_uri: redirectUri, client_id: requestClientId, code_verifier: codeVerifier } = req.body;
	if (req.body.client_secret) {
		return res.status(400).json({ error: 'invalid_client' });
	}
	if (
		grantType !== 'authorization_code' ||
		requestClientId !== clientId ||
		typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code) ||
		typeof redirectUri !== 'string' ||
		typeof codeVerifier !== 'string'
	) {
		return res.status(400).json({ error: 'invalid_request' });
	}

	if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)) {
		return res.status(400).json({ error: 'invalid_grant' });
	}

	try {
		const storedCode = createHash('sha256').update(code, 'ascii').digest('hex');
		const lookup = await sql.executeQuery('select', 'authorization_codes', { code: storedCode }) as QueryResponse;
		if (lookup.error) {
			return res.status(500).json({ error: 'server_error' });
		}
		const authorization = (lookup.data && lookup.data[0]) as AuthorizationCodeRecord | undefined;
		if (!authorization || authorization.client_id !== requestClientId || authorization.redirect_uri !== redirectUri || authorization.code_challenge_method !== 'S256') {
			return res.status(400).json({ error: 'invalid_grant' });
		}

		const actualChallenge = createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');
		const expectedChallenge = Buffer.from(authorization.code_challenge);
		const actualChallengeBuffer = Buffer.from(actualChallenge);
		if (expectedChallenge.length !== actualChallengeBuffer.length || !timingSafeEqual(expectedChallenge, actualChallengeBuffer)) {
			return res.status(400).json({ error: 'invalid_grant' });
		}

		const accountResult = await sql.executeQuery('select', 'user', { id: authorization.user_id }) as QueryResponse;
		if (accountResult.error) {
			return res.status(500).json({ error: 'server_error' });
		}
		const account = (accountResult.data && accountResult.data[0]) as Account | undefined;
		if (!account || Number(account.active) !== 1) {
			return res.status(400).json({ error: 'invalid_grant' });
		}

		// Atomically mark the authorization code used; simultaneous replays can only win once.
		const consumed = await sql.executeStmt(
			'update authorization_codes set used = 1 where code = ? and client_id = ? and redirect_uri = ? and used = 0 and expires_at > UTC_TIMESTAMP()',
			[storedCode, requestClientId, redirectUri]
		);
		if (consumed.error) {
			return res.status(500).json({ error: 'server_error' });
		}
		if (consumed.affectedRows !== 1) {
			return res.status(400).json({ error: 'invalid_grant' });
		}

		const issuedAt = Math.floor(Date.now() / 1000);
		const expiresAt = issuedAt + accessTokenLifetimeSeconds;
		const userName = `${account.first_name} ${account.last_name}`.trim();
		const grantedScopes = new Set(authorization.scope.split(' '));
		const accessTokenClaims: Record<string, string> = {
			iss: issuer,
			sub: String(account.id),
			aud: accessTokenAudience,
			client_id: authorization.client_id,
			scope: authorization.scope
		};
		if (grantedScopes.has('profile')) {
			accessTokenClaims.name = userName;
			accessTokenClaims.given_name = account.first_name;
			accessTokenClaims.family_name = account.last_name;
		}
		if (grantedScopes.has('email')) {
			accessTokenClaims.email = account.email;
		}
		const accessToken = sign(accessTokenClaims, privateKey, { algorithm: 'RS256', keyid: signingKeyId, expiresIn: accessTokenLifetimeSeconds });
		const idTokenClaims: Record<string, string> = {
			iss: issuer,
			sub: String(account.id)
		};
		if (grantedScopes.has('profile')) {
			idTokenClaims.name = userName;
			idTokenClaims.given_name = account.first_name;
			idTokenClaims.family_name = account.last_name;
		}
		if (grantedScopes.has('email')) {
			idTokenClaims.email = account.email;
		}
		const idToken = sign({
			...idTokenClaims,
			aud: authorization.client_id,
			...(authorization.nonce ? { nonce: authorization.nonce } : {})
		}, privateKey, { algorithm: 'RS256', keyid: signingKeyId, expiresIn: accessTokenLifetimeSeconds });

		return res.json({
			access_token: accessToken,
			token_type: 'Bearer',
			expires_in: expiresAt - issuedAt,
			scope: authorization.scope,
			id_token: idToken
		});
	} catch {
		return res.status(500).json({ error: 'server_error' });
	}
});

const getAccessTokenClaims = (req: Request): Record<string, unknown> | null => {
	const authorizationHeader = req.get('authorization') || '';
	const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
	if (!match) {
		return null;
	}

	try {
		return verify(match[1], publicKey, {
			algorithms: ['RS256'],
			issuer,
			audience: accessTokenAudience
		}) as Record<string, unknown>;
	} catch {
		return null;
	}
};

router.get('/userinfo', (req, res) => {
	const token = getAccessTokenClaims(req);
	if (!token || typeof token.sub !== 'string' || typeof token.scope !== 'string' || !token.scope.split(' ').includes('openid')) {
		return res.status(401).set('WWW-Authenticate', 'Bearer').json({ error: 'invalid_token' });
	}

	const userInfo: Record<string, unknown> = { sub: token.sub };
	const grantedScopes = new Set(token.scope.split(' '));
	if (grantedScopes.has('profile')) {
		userInfo.name = token.name;
		userInfo.given_name = token.given_name;
		userInfo.family_name = token.family_name;
	}
	if (grantedScopes.has('email')) {
		userInfo.email = token.email;
		userInfo.email_verified = false;
	}
	return res.set('Cache-Control', 'no-store').json(userInfo);
});

router.get('/profile', (req, res) => {
	const token = getAccessTokenClaims(req);
	if (!token || typeof token.sub !== 'string' || typeof token.scope !== 'string') {
		return res.status(401).set('WWW-Authenticate', 'Bearer error="invalid_token"').json({ error: 'invalid_token' });
	}
	if (!token.scope.split(' ').includes('api.read')) {
		return res.status(403).set('WWW-Authenticate', 'Bearer error="insufficient_scope", scope="api.read"').json({ error: 'insufficient_scope' });
	}

	return res.set('Cache-Control', 'no-store').json({
		id: token.sub,
		...(token.name ? { name: token.name } : {}),
		...(token.email ? { email: token.email } : {})
	});
});

export default router;
