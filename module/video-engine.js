'use strict';

const fs = require('fs'),
	ffmpeg = require('fluent-ffmpeg'),
	config = require('./video-config');
	
const createVideo = (req, res) => {
	Promise.all(config.processPhoto(req)).then(paths => {
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
					fs.unlink(path, (error) => {});
				});
				res.send({mPegFour: `${mp4}.mp4`});
			})
			.on('error', err => {})
			.run();		
	}).catch((e) => {
		res.send({error: 'Something wrong, e.g. no image selected, etc.'});
	});
};

exports.createVideo = createVideo;
