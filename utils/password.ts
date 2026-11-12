import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const SCRYPT_COST = 1 << 17;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SALT_SIZE = 16;
const KEY_SIZE = 32;
const MAX_MEMORY = 256 * 1024 * 1024;

const deriveKey = (password: string, salt: Buffer): Promise<Buffer> => new Promise((resolve, reject) => {
	scryptCallback(password, salt, KEY_SIZE, {
		N: SCRYPT_COST,
		r: SCRYPT_BLOCK_SIZE,
		p: SCRYPT_PARALLELIZATION,
		maxmem: MAX_MEMORY
	}, (error, derivedKey) => {
		if (error) {
			reject(error);
		} else {
			resolve(derivedKey);
		}
	});
});

export const hashPassword = async (password: string): Promise<string> => {
	const salt = randomBytes(SALT_SIZE);
	const derivedKey = await deriveKey(password, salt);
	return `scrypt$${SCRYPT_COST}$${SCRYPT_BLOCK_SIZE}$${SCRYPT_PARALLELIZATION}$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
};

export const verifyPassword = async (password: string, encodedHash: string): Promise<boolean> => {
	const [algorithm, cost, blockSize, parallelization, saltText, hashText, ...extra] = encodedHash.split('$');
	if (
		algorithm !== 'scrypt' ||
		Number(cost) !== SCRYPT_COST ||
		Number(blockSize) !== SCRYPT_BLOCK_SIZE ||
		Number(parallelization) !== SCRYPT_PARALLELIZATION ||
		!saltText ||
		!hashText ||
		extra.length > 0
	) {
		return false;
	}

	const salt = Buffer.from(saltText, 'base64url');
	const expected = Buffer.from(hashText, 'base64url');
	if (salt.length !== SALT_SIZE || expected.length !== KEY_SIZE) {
		return false;
	}

	const actual = await deriveKey(password, salt);
	return timingSafeEqual(actual, expected);
};
