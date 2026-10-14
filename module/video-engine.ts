'use strict';

const fs = require('fs'),
	ffmpeg = require('fluent-ffmpeg'),
	config = require('./video-config');
	
interface UploadedImage extends Express.Multer.File {}

interface VideoRequest {
	files: UploadedImage[];
}

interface VideoResponse {
	send(body: Record<string, string>): unknown;
}

const createVideo = (req: VideoRequest, res: VideoResponse): void => {
	Promise.all(config.processPhoto(req)).then((paths: string[]) => {
		let mp4 = Date.now().toString(),
			comman = ffmpeg();
		comman
			.input(`${config.path}/image_%03d.png`)
			.inputFPS(1/2)
			.output(`${config.path}/${mp4}.mp4`)
			.outputFPS(10)
			.duration(20)
			.noAudio()
			.on('end', () => {
				paths.forEach(path => {
					fs.unlink(path, (_error: NodeJS.ErrnoException | null) => {});
				});
				res.send({mPegFour: `${mp4}.mp4`});
			})
			.on('error', () => {})
			.run();		
	}).catch((e) => {
		res.send({error: 'Something wrong, e.g. no image selected, etc.'});
	});
};

export {createVideo};
