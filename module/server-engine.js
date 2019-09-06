'use strict';

const LANG_LABELS = require('../js/language').label(), 
	session = require('./session'),
	mail = require('./email'),
	helper = require('./helper'),
	sql = require('./sql-engine'),
	content = require('../js/static-content'),
	template = require('../js/mail-template');

const request = (req, res) => {
	const action = req.body.action || req.body.f_action,
		error = [],
		lang = req.cookies.lang;

	if(action === 'connection') {
		res.send({connectionSuccess: 1});
	}else if(action === 'hits') {
		sql.executeStmt(`insert into visitor_hits (ip, create_time, uri) VALUES (?, now(), ?)`, [req.ip, req.body.uri]).then(() => {
			res.send({message: 'ok'});
		}).catch(() => { res.send({error: LANG_LABELS.unknown_error[lang]}); });
	}else if(action === 'contact_us') {
		let email	= req.body.email,
			message	= req.body.message, 
			subject = req.body.subject;
			
		if(email === '') {
			error.push(LANG_LABELS.r_email[lang]);
		}else if(!helper.validEmail(email)) {
			error.push(LANG_LABELS.w_email[lang]);
		}
		if(subject === '') {
			error.push(LANG_LABELS.r_subject[lang]);
		}
		if(helper.isNothing(message)) {
			error.push(LANG_LABELS.r_message[lang]);
		}
		
		if(error.length) {
			res.send({error: error});
		}else {
			mail.subject(subject);
			mail.replyTo(email);
			mail.to(content.get('site_config').admin_email);
			mail.html(message);
			mail.send().then(response => {
				res.send(response.success ? {message: LANG_LABELS.contact_sent[lang]} : {error: response.error || LANG_LABELS.unknown_error[lang]});
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}		
	}else if(action === 'email_friend') {
		let sender = req.body.email || '',
			friend = req.body.friend_email || '',
			aid = req.body.advertise_id || '';
			
		if(sender === '') {
			error.push(LANG_LABELS.r_email[lang]);
		}else if(!helper.validEmail(sender)) {
			error.push(LANG_LABELS.w_email[lang]);
		}
		if(friend === '') {
			error.push(LANG_LABELS.r_friend_email[lang]);
		}else if(!helper.validEmail(friend)) {
			error.push(LANG_LABELS.w_friend_email[lang]);
		}
		if(aid === '') {
			error.push(LANG_LABELS.info_missing[lang]);
		}
		if(error.length) {
			res.send({error: error});
		}

		sql.executeQuery('select', 'advertise', { id: aid }, ['html','currency','name','price','create_time','now() as today']).then(promise => {
			let ad = (promise.data && promise.data[0]) || null;

			if(!ad) {
				res.send({error: LANG_LABELS.no_ad_found[lang]});
			}else {
				mail.subject(LANG_LABELS.friend_share_sub[lang]);
				mail.replyTo(sender);
				mail.to(friend);
				mail.html(helper.replace(template.get(`email_to_friend_html_${lang}`), {
					name: ad.name,
					id: aid,
					sender: sender,
					domain: content.get('site_config').domain,
					time: ad.create_time,
					price: ad.currency ? LANG_LABELS[`currency_${ad.currency}`][lang] + helper.dollarValue(ad.price) : LANG_LABELS.c_free_offer[lang],
					today: ad.today
				}));
				mail.send().then(response => {
					res.send(response.success ? {message: `${LANG_LABELS.link_sent[lang]} ${friend}`} : {error: response.error || LANG_LABELS.unknown_error[lang]});
				}).catch((e) => {console.log(e);
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}
		}).catch((e) => {console.log(e);
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'ask_poster') {
		let id		= req.body.advertise_id || '',
			email	= req.body.email.toLowerCase() || '',
			message	= req.body.message;
			
		if(email === '') {
			error.push(LANG_LABELS.r_email[lang]);
		}else if(!helper.validEmail(email)) {
			error.push(LANG_LABELS.w_email[lang]);
		}
		if(helper.isNothing(message)) {
			error.push(LANG_LABELS.r_message[lang]);
		}
		
		if(error.length) {
			res.send({error: error});
		}

		sql.executeQuery('select', 'advertise', { id: id }, ['html','currency','name','user_id','price','contact_method','contact_email','create_time','now() as today']).then(promise => {
			let ad = (promise.data && promise.data[0]) || null;
				
			if(!ad) {
				res.send({error: LANG_LABELS.no_ad_found[lang]});
			}

			sql.executeQuery('select', 'user', { id: ad.user_id }, ['first_name','last_name','email']).then(promise => {
				let user = (promise.data && promise.data[0]) || null;
				if(!user) {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				}

				let title = ad.contact_method.match(/\bemail\b/) ? LANG_LABELS.buddy[lang] : (lang === 'en' ? `${user.first_name} ${user.last_name}` : `${user.last_name} ${user.first_name}`),
					rcpt = ad.contact_method.match(/\bemail\b/) ? ad.contact_email : user.email;

				mail.subject(ad.name);
				mail.replyTo(email);
				mail.to(rcpt);
				mail.html(helper.replace(template.get(`ask_poster_html_${lang}`), {
					title: title,
					email: email,
					web_root: content.get('site_config').web_root,
					id: id,
					name: ad.name,
					time: ad.create_time,
					price: ad.currency ? LANG_LABELS[`currency_${ad.currency}`][lang] + ad.price : '0.00',
					message: helper.htmlParagraph(message),
					domain: content.get('site_config').domain,
					today: ad.today
				}));
				mail.send().then(response => {
					res.send(response.success ? {message: LANG_LABELS.msg_sent_to_seller[lang]} : {error: response.error || LANG_LABELS.unknown_error[lang]});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'validate_acc_code') {
		let accCode = req.body.acc_code || null,
			lang = 'en';
		if(accCode.match(/(:?cn|en)$/)) {
			lang = RegExp.$1;
			accCode = accCode.replace(/(:?cn|en)$/, '');
		}
		if(accCode) {
			sql.executeQuery('select', 'user', { acc_code: accCode }).then(promise => {
				let user = (promise.data && promise.data[0]) || null;
				if(user) {
					res.send({ok: 1, lang: lang});
				}else {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				}
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}else {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		}
	}else if(action === 'find_visitor_ad') {
		const emailPhone = (req.body.email_phone || '').toLowerCase(),
			postId = (req.body.post_id || '').trim();
			
		sql.executeQuery('select id, user_id from advertise where post_id=? and (contact_phone=? or contact_email=?)', [postId, emailPhone, emailPhone]).then(promise => {
			let ad = (promise.data && promise.data[0]) || null;
			if(ad) {
				let [id, uid] = [ad.id, ad.user_id];
				session.create(req.cookies.session_id || null).then(promise => {
					session.set(promise.sessionId, {visitor: {v_ad_id: id, v_user_id: uid, v_post_id: postId}}).then(() => {
					res.cookie('session_id', promise.sessionId);
						res.send({ok: 1});						
					});
				});
			}else {
				res.send({error: LANG_LABELS.no_retrieve_result[lang]});
			}
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});			
	}else {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	}
};

exports.request = request;