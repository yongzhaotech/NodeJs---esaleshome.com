import { createHash } from 'node:crypto';

export const hashSha256 = (refreshToken: string): Buffer => {
    return createHash('sha256').update(refreshToken, 'utf8').digest();
};
