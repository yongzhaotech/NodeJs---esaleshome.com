'use strict';

const content = require('../js/static-content'),
	crypto = require('crypto');

const validEmail = eml => eml.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);

const validPhone = ph => ph.match(/^\d{10,20}$/);

const calculatePages = (currentIndex, total, pages = {}) => {
    let size = content.get('site_config').page_size,
		pageNumber = total % size ? Math.floor(total / size) + 1 : total / size;
		
    pages.c = currentIndex;
    for(let i = 0; i < pageNumber; i++) {
		if(!('p' in pages)) {
			pages.p = [];
		}
		pages.p.push({ i: i * size, n: i + 1 });
    }
	return pages;
};

const replace = (replacee, replacer) => {
	Object.keys(replacer).forEach(key => {
		let reg = new RegExp('\\[\\% *' + key + ' *\\%\\]', 'g');
		replacee = replacee.replace(reg, replacer[key]);
	});
	
	return replacee;
};

const htmlParagraph = source => source.replace(/[\n]/g, '<br>');

const isNothing = data => data.replace(/[\r\n\s]/g, '') === '';

const uuid = (str = null) => {
	let epoch = str || '' + Date.now(),
		hash = crypto.createHash('sha256');

	hash.update(epoch);
	return hash.digest('hex');
};

const siteEncryption = (...args) => {
	args.push(content.get('site_config').encript);
	return uuid(args.join('::'));
};

const dollarValue = value => `${Math.round(value)}.00`;

exports.validEmail = validEmail;
exports.validPhone = validPhone;
exports.calculatePages = calculatePages;
exports.replace = replace;
exports.htmlParagraph = htmlParagraph;
exports.isNothing = isNothing;
exports.uuid = uuid;
exports.siteEncryption = siteEncryption;
exports.dollarValue = dollarValue;
exports.uploadDirectory = './file/upload';
