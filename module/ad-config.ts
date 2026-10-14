'use strict';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';
import type { RowDataPacket } from 'mysql2';

const sql = require('./sql-engine'),
	path = require('path'),
	fs = require('fs'),
	{Jimp, JimpMime, scaleToFit} = require('./image-utils');

interface UploadedImage extends Express.Multer.File {}

interface PhotoRequest extends Request {
	files: UploadedImage[];
	body: Request['body'] & {
		remove_ad_image?: string;
	};
}

interface PhotoOwner {
	id?: string | number;
	v_user_id?: string | number;
}

interface PictureRow extends RowDataPacket {
	id: number | string;
}

interface DatabaseFetch {
	data?: PictureRow[];
	error?: unknown;
}

interface DatabaseExecute {
	key?: number | null;
	error?: unknown;
}

const appRoot = path.basename(path.resolve(__dirname, '..')) === 'dist' ? path.resolve(__dirname, '..', '..') : path.resolve(__dirname, '..'),
imageDirectory = process.env.AD_IMAGE_DIR || path.resolve(appRoot, 'image', 'ad'),
uploadDirectory = './file/upload',
mimeType: Record<string, true> = ({
	[JimpMime.png]: true,
	[JimpMime.jpeg]: true,
	[JimpMime.bmp]: true
}),
smallImageWidth = 100,
smallImageHeight = 100,
largeImageWidth = 500,
largeImageHeight = 500,
smallImage = path.join(imageDirectory, 'small'),
largeImage = path.join(imageDirectory, 'large'),
smallMask = `${uploadDirectory}/small_mask.jpg`;

const deleteFile = (file: UploadedImage): void => {
	fs.unlink(`${uploadDirectory}/${file.filename}`, (_error: NodeJS.ErrnoException | null) => {});
};

const processPhoto = (req: PhotoRequest, advertiseId: string | number, mainPict: string | number): Promise<number>[] => {
	if(req.files.length) {
		return req.files.map(file => {
			return new Promise((res, rej) => {
				let num = file.fieldname.split('_').pop(),
					isMain = Number(num) === +mainPict ? 1 : 0;
				sql.executeStmt('insert into picture (advertise_id, is_main, create_time, edit_time) values (?, ?, now(), now())', [advertiseId, isMain]).then((promise: DatabaseExecute) => {
					if(promise.error) {
						deleteFile(file);
						rej(1);
					}else {
						let pictureId = promise.key,
							photo = `${uploadDirectory}/${file.filename}`,
							small = `${smallImage}/${pictureId}.jpg`,
							large = `${largeImage}/${pictureId}.jpg`;
						Jimp.read(photo).then((image: Awaited<ReturnType<typeof Jimp.read>>) => {
							let copy = scaleToFit(image.clone(), smallImageWidth, smallImageHeight),
								[x, y] = [Math.floor((smallImageWidth - copy.bitmap.width) / 2), Math.floor((smallImageHeight - copy.bitmap.height) / 2)];
							return Promise.all([
								scaleToFit(image.clone(), largeImageWidth, largeImageHeight).write(large),
								Jimp.read(smallMask).then((source: Awaited<ReturnType<typeof Jimp.read>>) => source.composite(copy, x, y).write(small))
							]);
						}).then(() => {
							deleteFile(file);
							res(1);
						}).catch((error: unknown) => {
							deleteFile(file);
							rej(error);
						});
					}
				}).catch(() => {
					deleteFile(file);
					rej(1);
				});
			}) as Promise<number>;
		});
	}
	return [Promise.resolve(1)];
};

const deletePhoto = (req: PhotoRequest, advertiseId: string | number, user: PhotoOwner): Promise<number> => {
	let photoIdsString = (req.body.remove_ad_image || '').trim(),
		photoIds = ((photoIdsString && photoIdsString.split(',')) || []).map((id: string) => +id);

	if(photoIds.length) {
		return new Promise((res, rej) => {
			let id = user.id || user.v_user_id;
			sql.executeQuery('select', `select p.id "id" from picture p,advertise a where p.advertise_id=a.id and a.id=? and a.user_id=? and p.id in (${photoIds.join(',')})`, [advertiseId, id]).then((promise: DatabaseFetch) => {
				if(promise.data) {
					let goIds = promise.data.map(elem => +elem.id);
					sql.executeStmt(`delete from picture where id in (${goIds.join(',')})`).then((_prom: unknown) => {
						goIds.forEach(pictureId => {
							fs.unlink(`${smallImage}/${pictureId}.jpg`, (_error: NodeJS.ErrnoException | null) => {});
							fs.unlink(`${largeImage}/${pictureId}.jpg`, (_error: NodeJS.ErrnoException | null) => {});
						});
						res(1);
					}).catch(() => {
						rej(1);
					});
				}else {
					rej(1);
				}
			}).catch(() => {
				rej(1);
			});
		});
	}
	return Promise.resolve(1);
};

const deleteAdvertise = (advertiseId: string | number): Promise<number> => {
	return new Promise((res, rej) => {
		sql.executeQuery('select', 'picture', { advertise_id: advertiseId }).then((promise: DatabaseFetch) => {
			(promise.data || []).forEach(data => {
				let pictureId = data.id;
				fs.unlink(`${smallImage}/${pictureId}.jpg`, (_error: NodeJS.ErrnoException | null) => {});
				fs.unlink(`${largeImage}/${pictureId}.jpg`, (_error: NodeJS.ErrnoException | null) => {});		
			});
			sql.executeQuery('delete', 'advertise', { id: advertiseId }).then(() => {
				sql.executeQuery('delete', 'picture', { advertise_id: advertiseId }).then(() => {
					res(1);
				}).catch(() => {
					rej(1);
				});
			}).catch(() => {
				rej(1);
			});
		}).catch(() => {
			rej(1);
		});
	});
};

exports.uploadDirectory = uploadDirectory;
exports.imageDirectory = imageDirectory;
exports.photoSize = 7340032;
exports.fileCount = 10;
exports.mimeType = mimeType;
exports.processPhoto = processPhoto;
exports.deletePhoto = deletePhoto;
exports.deleteAdvertise = deleteAdvertise;
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
	cb(null, mimeType[file.mimetype] || false);
};

exports.fileFilter = fileFilter;
