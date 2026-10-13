'use strict';

const fs = require('fs'),
	path = require('path'),
	{Jimp, JimpMime, scaleToFit} = require('./image-utils');

const root = process.env.VIDEO_OUTPUT_DIR || path.resolve(__dirname, '..', 'file', 'video'),
uploadDirectory = './file/upload',
mimeType = ({
	[JimpMime.png]: true,
	[JimpMime.jpeg]: true,
	[JimpMime.bmp]: true
}),
smallImageWidth = 300,
smallImageHeight = 300,
smallMask = `${uploadDirectory}/mask.jpg`;

const deleteFile = file => {
	fs.unlink(`${uploadDirectory}/${file.filename}`, (error) => {});
};

const processPhoto = req => {
	if(req.files.length) {
		return req.files.map(file => {
			return new Promise((res, rej) => {
				let pictureId = file.fieldname.split('_').pop(),
					photo = `${uploadDirectory}/${file.filename}`,
					small;
					
				if(pictureId.length === 1) {
					pictureId = '00' + pictureId;
				}else if(pictureId.length === 2) {
					pictureId = '0' + pictureId;
				}
				
				small = `${root}/image_${pictureId}.png`;
				
				Jimp.read(photo).then(image => {
					return Jimp.read(smallMask).then(source => {
						let copy = scaleToFit(image.clone(), smallImageWidth, smallImageHeight),
							[x, y] = [Math.floor((smallImageWidth - copy.bitmap.width) / 2), Math.floor((smallImageHeight - copy.bitmap.height) / 2)];
						return source.composite(copy, x, y).write(small);
					});
				}).then(() => {
					deleteFile(file);
					res(small);
				}).catch(error => {
					deleteFile(file);
					rej(error);
				});
			});
		});
	}
	return [Promise.reject(1)];
};

exports.processPhoto = processPhoto;
exports.path = root;
