type CookieOptions = {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict';
};

export const AUTH_STATUS = {
    OK: 'OK',
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
} as const;

export type AuthStatus = typeof AUTH_STATUS[keyof typeof AUTH_STATUS];

type AuthStatusResponse = {
    [key in AuthStatus]: {
        status: number;
    } & (key extends 'OK' ? {} : { message: { error: string; code: AuthStatus } });
};

const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
};

const accessTokenExpiresIn = '15m';

const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

const refreshTokenExpiresIn = '7d';

const secret = process.env.JWT_SECRET as string;

const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

export const sessionLifeTime = refreshTokenMaxAge; 

export const jwtConfig = {
    accessTokenExpiresIn,
    refreshTokenMaxAge,
    refreshTokenExpiresIn,
    secret,
    refreshSecret,
    COOKIE_OPTIONS
} as const;

export const Auth: AuthStatusResponse = {
    [AUTH_STATUS.OK]: { status: 200 },
    [AUTH_STATUS.AUTH_REQUIRED]: { status: 401, message: { error: 'Authentication required', code: 'AUTH_REQUIRED' } },
    [AUTH_STATUS.TOKEN_EXPIRED]: { status: 403, message: { error: 'Token expired', code: 'TOKEN_EXPIRED' } },
    [AUTH_STATUS.INVALID_TOKEN]: { status: 401, message: { error: 'Invalid token', code: 'INVALID_TOKEN' } },
};