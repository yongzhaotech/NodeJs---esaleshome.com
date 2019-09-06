'use strict';

const fs = require('fs'),
	jimp = require('jimp');

const root = 'C:/UI/Node/server/file/video', 
uploadDirectory = './file/upload',
mimeType = ({
	[jimp.MIME_PNG]: true,
	[jimp.MIME_JPEG]: true,
	[jimp.MIME_BMP]: true
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
				
				jimp.read(photo).then(image => {
					jimp.read(smallMask).then(source => {
						let copy = image.clone().scaleToFit(smallImageWidth, smallImageHeight),
							[x, y] = [Math.floor((smallImageWidth - copy.bitmap.width) / 2), Math.floor((smallImageHeight - copy.bitmap.height) / 2)];
						source.composite(copy, x, y).writeAsync(small).then(() => {}).catch(() => {});
						deleteFile(file);
						res(small);
					}).catch((e) => {
						deleteFile(file);
						rej(1);								
					});
				}).catch((e) => {
					deleteFile(file);
					rej(1);
				});
			});
		});
	}
	return [Promise.reject(1)];
};

exports.processPhoto = processPhoto;
exports.path = root;
