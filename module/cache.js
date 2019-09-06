'use strict';

const store = new Map(),
milliSeconds = 1800000,
clear = () => {
	store.clear();
},
key = (script, requestData = {}) => Object.keys(requestData).reduce((acc, cur) => `${acc}&${cur}=${requestData[cur]}`, script),
get = cacheKey => {
	if(store.has(cacheKey)) {
		let time = store.get(cacheKey).time,
			now = Date.now(),
			diff = now - time;

		return diff > milliSeconds ? null : store.get(cacheKey).data;
	}else {
		return null;
	}
},
add = (cacheKey, json) => {
	store.set(cacheKey, {
		time: Date.now(),
		data: json
	});
};

exports.clear = clear;
exports.key = key;
exports.get = get;
exports.add = add;