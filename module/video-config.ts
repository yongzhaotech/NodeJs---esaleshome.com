'use strict';
import type { Request } from 'express';

const fs = require('fs'),
	path = require('path'),
	{Jimp, JimpMime, scaleToFit} = require('./image-utils');

interface UploadedImage extends Express.Multer.File {}

interface VideoRequest extends Request {
	files: UploadedImage[];
}

const appRoot = path.basename(path.resolve(__dirname, '..')) === 'dist' ? path.resolve(__dirname, '..', '..') : path.resolve(__dirname, '..'),
root = process.env.VIDEO_OUTPUT_DIR || path.resolve(appRoot, 'file', 'video'),
uploadDirectory = './file/upload',
mimeType = ({
	[JimpMime.png]: true,
	[JimpMime.jpeg]: true,
	[JimpMime.bmp]: true
}),
smallImageWidth = 300,
smallImageHeight = 300,
smallMask = `${uploadDirectory}/mask.jpg`;

const deleteFile = (file: UploadedImage): void => {
	fs.unlink(`${uploadDirectory}/${file.filename}`, (_error: NodeJS.ErrnoException | null) => {});
};

const processPhoto = (req: VideoRequest): Promise<string>[] => {
	if(req.files.length) {
		return req.files.map(file => {
			return new Promise((res, rej) => {
				let pictureId = file.fieldname.split('_').pop() || '',
					photo = `${uploadDirectory}/${file.filename}`,
					small;
					
				if(pictureId.length === 1) {
					pictureId = '00' + pictureId;
				}else if(pictureId.length === 2) {
					pictureId = '0' + pictureId;
				}
				
				small = `${root}/image_${pictureId}.png`;
				
				Jimp.read(photo).then((image: Awaited<ReturnType<typeof Jimp.read>>) => {
					return Jimp.read(smallMask).then((source: Awaited<ReturnType<typeof Jimp.read>>) => {
						let copy = scaleToFit(image.clone(), smallImageWidth, smallImageHeight),
							[x, y] = [Math.floor((smallImageWidth - copy.bitmap.width) / 2), Math.floor((smallImageHeight - copy.bitmap.height) / 2)];
						return source.composite(copy, x, y).write(small);
					});
				}).then(() => {
					deleteFile(file);
					res(small);
				}).catch((error: unknown) => {
					deleteFile(file);
					rej(error);
				});
			}) as Promise<string>;
		});
	}
	return [Promise.reject(1)];
};

exports.processPhoto = processPhoto;
exports.path = root;
