import { createHash } from 'node:crypto';

export const hashRefreshToken = (refreshToken: string): Buffer => {
    return createHash('sha256').update(refreshToken, 'utf8').digest();
};
