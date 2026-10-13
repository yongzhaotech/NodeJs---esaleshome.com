'use strict';

const {Jimp, JimpMime} = require('jimp');

const scaleToFit = (image, width, height) => {
	const scale = Math.min(width / image.bitmap.width, height / image.bitmap.height);
	return image.resize({
		w: Math.round(image.bitmap.width * scale),
		h: Math.round(image.bitmap.height * scale)
	});
};

exports.Jimp = Jimp;
exports.JimpMime = JimpMime;
exports.scaleToFit = scaleToFit;
