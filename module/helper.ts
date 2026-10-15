'use strict';

const content = require('../js/static-content'),
	crypto = require('crypto');

interface PageLink {
	i: number;
	n: number;
}

interface PageInfo {
	c?: string | number;
	p?: PageLink[];
	s?: number;
}

const validEmail = (eml: string): RegExpMatchArray | null => eml.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);

const validPhone = (ph: string): RegExpMatchArray | null => ph.match(/^\d{10,20}$/);

const calculatePages = (currentIndex: string | number, total: number, pages: PageInfo = {}): PageInfo => {
    let size: number = content.get('site_config').page_size,
		pageNumber = total % size ? Math.floor(total / size) + 1 : total / size;
		
    pages.c = currentIndex;
    for(let i = 0; i < pageNumber; i++) {
		let pageLinks = pages.p;
		if(!pageLinks) {
			pageLinks = [];
			pages.p = pageLinks;
		}
		pageLinks.push({ i: i * size, n: i + 1 });
    }
	return pages;
};

const replace = (replacee: string, replacer: Record<string, string | number>): string => {
	Object.keys(replacer).forEach(key => {
		let reg = new RegExp('\\[\\% *' + key + ' *\\%\\]', 'g');
		replacee = replacee.replace(reg, String(replacer[key]));
	});
	
	return replacee;
};

const htmlParagraph = (source: string): string => source.replace(/[\n]/g, '<br>');

const isNothing = (data: string): boolean => data.replace(/[\r\n\s]/g, '') === '';

const uuid = (str: string | null = null): string => {
	let epoch = str || '' + Date.now(),
		hash = crypto.createHash('sha256');

	hash.update(epoch);
	return hash.digest('hex');
};

const siteEncryption = (...args: string[]): string => {
	args.push(content.get('site_config').encript);
	return uuid(args.join('::'));
};

const dollarValue = (value: number | string): string => `${Math.round(Number(value))}.00`;

const uploadDirectory = './file/upload';

export {
	validEmail,
	validPhone,
	calculatePages,
	replace,
	htmlParagraph,
	isNothing,
	uuid,
	siteEncryption,
	dollarValue,
	uploadDirectory
};
