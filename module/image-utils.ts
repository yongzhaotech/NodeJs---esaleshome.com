'use strict';

const {Jimp, JimpMime} = require('jimp');

type JimpImage = Awaited<ReturnType<typeof Jimp.read>>;

const scaleToFit = (image: JimpImage, width: number, height: number): JimpImage => {
	const scale = Math.min(width / image.bitmap.width, height / image.bitmap.height);
	return image.resize({
		w: Math.round(image.bitmap.width * scale),
		h: Math.round(image.bitmap.height * scale)
	});
};

export {Jimp, JimpMime, scaleToFit};
