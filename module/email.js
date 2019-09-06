'use strict';

let _mail = {},
	_time = null,
	_boundary = null,
	options = {
		host: 'out.teksavvy.com',
		port: 1025,
		name: 'esaleshome.com',
		secure: false,
		auth: {
			user: 'laoyezhao@teksavvy.com',
			pass: 'Andrew12345'
		},
		dkim: {
			domainName: 'esaleshome.com',
			keySelector: 'laoye1',
			privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCqZYOcLiqR6MaMYwGY8SsZKHdj7TMF04ColcK8B4gRRR5vwVd0
xm9vLoic7/EIG2M/+6MkiXFuWX4KbWDwDAEYNedbZXxg+jhDMQ/OCzVyyk0ytqdK
ThyY8EVCpbMk5593afW6Z8ZIpsevjP/FBngfXyx6NW7wAnZe1GncajwQPwIDAQAB
AoGARUzwD+7+xUTkq2gA2FENdDfvBqcL30y7wNTX1F1Dy7JOxKjfhtDFtXQ5f4pe
fyuUXAtduJhll7mx90+w4zAeqS4tL8DB38KliCXumc6F9bJJ4QwaYufcId1B0aD7
XtTnoPuLr/TqIx2skHPoBR5SBtE9qtDqFSIerNZ7lFQndLECQQDTJznXfWgD4RIJ
+RaxYy6txhD5S9Dc30srrdk4oOfJbBQkB/4L2ocECdBxu22tquPRSF/TzjVoAa1n
viD/23wVAkEAzpZGauKiUvlKSIs42RWD3Tf6NRzJCucJyu76SyhUvhfS4tdwUtWH
+MNiIJ8r2qngfaeYAOHPGPgOGO8q434sAwJBAKaexnrv/5tICJcMEscpj9UafZxr
IkaYgVXXWpjgB+eevInuMJ8j8vTR1cVZdGPdfOZRqSSXDPekkzRRCPM9PD0CQBXb
hHvOmsoYoilmwY8GXbtMLubrssG6jCiyfDzzeXPbZW6myLWa7hX95iX5cVRjYOMq
lkSRn63OoP82Xt1O/i0CQQCBf4bsUtNCFGfGZSOrnTPPmj+D8hIQAtJ5tWOzSSYo
KWfyTL93DDHe6BrJoPQ++aQlZ0jvYzKWjQPV5+qq4+1H
-----END RSA PRIVATE KEY-----`,
			headerFieldNames: 'subject:from:to'
		}
	},
	nodemailer = require('nodemailer'),
	transporter = nodemailer.createTransport(options),
	content = require('../js/static-content'),
	LANG_LABELS = require('../js/language').label();
	
const subject = arg => {
	_mail.subject = arg || 'No Subject';
};

const replyTo = arg => {
	_mail.replyTo = arg || null;
}

const to = arg => {
	_mail.to = _mail.to ? `{_mail.to},${arg}` : arg;
};

const text = arg => {
	_mail.text = arg;
};

const html = arg => {
	_mail.html = arg;
};

const send = () => {
	const body = {
		subject: _mail.subject,
		from: content.get('site_config').info_email,
		to: _mail.to,
		html: _mail.html
	};
	if(_mail.replyTo) {
		body['replyTo'] = _mail.replyTo
	}
	return new Promise((res, rej) => {
		transporter.sendMail(body, (error, success) => {
			if(error) {
				res({error: LANG_LABELS.unknown_error['cn']});
			}else {
				res({success: true});
			}
		});
	});
};

exports.subject = subject;
exports.replyTo = replyTo;
exports.to = to;
exports.text = text;
exports.send = send;
exports.html = html;
