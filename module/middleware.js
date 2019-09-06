'use strict';

const LANG_LABELS = require('../js/language').label(),
	content = require('../js/static-content'),
	session = require('./session'),
	sql = require('./sql-engine'),
	origins = {
		'http://www.esaleshome.com': true,
		'http://esaleshome.com': true,
		'www.esaleshome.com': true,
		'esaleshome.com': true,
		'http://localhost:3000': true,
		'http://192.168.0.149:3000': true
	};
		
const checkSession = (req, res) => {
	if(session.exist(req.cookies.session_id)) {
		return new Promise((resolve, reject) => {
			if(session.expire(req.cookies.session_id)) {
				session.remove(req.cookies.session_id).then(() => {
					res.clearCookie('session_id');
					res.clearCookie('user_is_signed_in');
					resolve(1);
				}).catch(() => {
					reject(1);
				});
			}else {
				session.update(req.cookies.session_id).then(() => {
					resolve(1);
				}).catch(() => {
					reject(1);
				});
			}
		});
	}else {
		return Promise.resolve(1);
	}	
};	
		
const accessControl = (req, res, next) => {
	let origin = req.get('origin');
	res.append('Access-Control-Allow-Credentials', true);
	if(origin.toLowerCase() in origins) {
		res.append('Access-Control-Allow-Origin', origin);
	}
	if(!req.cookies.lang) { res.cookie('lang', 'en'); }
	if(req.method === 'OPTIONS') { res.end(); return; }
	checkSession(req, res).then(pass => {
		next();
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});
};

const checkPermission = (req, res, next) => {
	let page = req.path.replace(/^\//, ""),
		lang = req.cookies.lang,
		auth = content.get('site_authenticate'),
		user = session.exist(req.cookies.session_id) && session.get(req.cookies.session_id, 'user') || null;

	if(auth[page]) {
		if(user) {
			if(+user.access_level < auth[page].access_level) {
				res.send({error: LANG_LABELS.no_permission[lang]});
			}else if(auth[page].check_ad) {
				sql.executeQuery('select user_id from advertise where id = ?', [req.body.aid || req.body.advertise_id]).then(promise => {
					let ad = promise.data && promise.data[0] || null;
					if(ad === null) {
						res.send({error: LANG_LABELS.no_such_post[lang]});
					}else if(+ad.user_id !== +user.id){
						res.send({error: LANG_LABELS.not_your_post[lang]});
					}else {
						next();
					}					
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
					return;
				});				
			}else {
				next();
			}
		}else {
			res.send({sessionExpire: LANG_LABELS.not_sign_in[lang]});
		}
	}else {
		next();
	}
};

exports.accessControl = accessControl;
exports.checkPermission = checkPermission;
