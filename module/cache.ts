'use strict';

interface CacheEntry {
	time: number;
	data: unknown;
}

type CacheRequestData = Record<string, string | number | boolean | null | undefined>;

const store = new Map<string, CacheEntry>(),
milliSeconds = 1800000,
clear = (): void => {
	store.clear();
},
key = (script: string, requestData: CacheRequestData = {}): string => Object.keys(requestData).reduce((acc, cur) => `${acc}&${cur}=${requestData[cur]}`, script),
get = <T = unknown>(cacheKey: string): T | null => {
	const entry = store.get(cacheKey);
	if(!entry) {
		return null;
	}

	return Date.now() - entry.time > milliSeconds ? null : entry.data as T;
},
add = (cacheKey: string, json: unknown): void => {
	store.set(cacheKey, {
		time: Date.now(),
		data: json
	});
};

export { clear, key, get, add };