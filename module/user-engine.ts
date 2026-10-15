'use strict';

import type { Request, Response } from 'express';

type DatabaseRow = Record<string, any>;

interface QueryResponse {
	data?: DatabaseRow[];
	ok?: number;
	error?: string[];
}

interface UserSession extends DatabaseRow {
	id: number | string;
	email: string;
	password?: string;
	last_sign_in?: string | null;
	first_name: string;
	last_name: string;
	access_level: number;
}

interface VisitorSession {
	v_ad_id: number | string;
	v_user_id: number | string;
}

interface SessionResponse {
	sessionId: string;
}

interface SqlEngine {
	executeQuery(...args: any[]): Promise<QueryResponse>;
	executeStmt(...args: any[]): Promise<QueryResponse>;
}

interface SessionEngine {
	exist(sessionId: string | undefined): boolean;
	get(sessionId: string, key: string): unknown;
	create(): Promise<SessionResponse>;
	set(sessionId: string, data: Record<string, unknown>): Promise<unknown>;
	remove(sessionId: string | undefined, keys?: string[]): Promise<unknown>;
}

interface SiteConfig {
	domain: string;
}

interface MailResponse {
	success?: boolean;
	error?: string;
}

interface MailEngine {
	subject(value: string): void;
	to(value: string): void;
	html(value: string): void;
	send(): Promise<MailResponse>;
}

const LANG_LABELS = require('../js/language').label(),
	session: SessionEngine = require('./session'),
	helper = require('./helper'),
	config: { deleteAdvertise(id: unknown): Promise<unknown> } = require('./ad-config'),
	mail: MailEngine = require('./email'),
	sql: SqlEngine = require('./sql-engine'),
	advertise = require('./ad-engine'),
	content = require('../js/static-content'),
	template = require('../js/mail-template');

const confidentialize = (user: UserSession): void => {
	delete user.password;
	delete user.last_sign_in;
};
	
const userAdvertiseDetail = (req: Request, res: Response, bind: unknown[]) => {
	const lang = req.cookies.lang;
	const sqlStmt = `select a.id as 'id',a.name as 'name',a.html as 'html',a.address as 'address',a.description as 'description',a.is_free,a.currency,a.price,a.contact_method as 'contact_method',a.contact_email as 'contact_email',a.contact_phone as 'contact_phone',a.city_id as 'city_id',a.province_id as 'province_id',cast(date(a.create_time) as char) as 'create_date',a.item_id as 'item_id',a.category_id as 'category_id',a.viewed as 'viewed',p.ids as 'picture_ids'
			from advertise a left outer join (
				select advertise_id,group_concat(concat(id,' ',is_main,' ',edit_time) separator ',') as 'ids' from picture group by advertise_id
			) p
			on a.id=p.advertise_id
			where a.active=? and a.user_id=? and a.id=?`;
	sql.executeQuery(sqlStmt, bind).then((promise: QueryResponse) => {
		let ad = promise.data && promise.data[0] || null;
		if(ad === null) {
			res.send(LANG_LABELS.unknown_error[lang]);
		}else {
			advertise.processAdvertise(ad);
			ad.images = ad.picture_ids;
			res.send({angular_ad: ad});
		}			
	}).catch(() => {
		res.send(LANG_LABELS.unknown_error[lang]);
	});
};		
			
const signIn = (req: Request, res: Response) => {
	const {email, password} = req.body;
	let error = [],
		user: UserSession | null = null,
		lang = req.cookies.lang;
		
	if(email === '') {
		error.push(LANG_LABELS.r_email[lang]);
	}else if(!helper.validEmail(email)) {
		error.push(LANG_LABELS.w_email[lang]);
	}
	
	if(error.length) {
		return res.send({error: error});
	}

	sql.executeQuery('select', 'user', { email: email }).then((promise: QueryResponse) => {
		user = (promise.data && promise.data[0] as UserSession) || null;
		if(!user) {
			return res.send({error: LANG_LABELS.email_not_found[lang]});
		}
		const authenticatedUser = user;

		if(password === '') {
			return res.send({error: LANG_LABELS.r_password[lang]});
		}else if(authenticatedUser.password !== helper.siteEncryption(email.toLowerCase(), password)) {
			return res.send({error: LANG_LABELS.wrong_password[lang]});
		}else {
			confidentialize(authenticatedUser);
			session.create().then(promise => {
				session.set(promise.sessionId, {user: authenticatedUser}).then(() => {
					res.cookie('session_id', promise.sessionId);
					res.cookie('user_is_signed_in', 1);
					res.send({user: { 
						email: authenticatedUser.email,
						first_name: authenticatedUser.first_name,
						last_name: authenticatedUser.last_name,
						access_level: authenticatedUser.access_level
					}});
				});
			});
		}
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});
};

const signOut = (req: Request, res: Response) => {
	const sessionId = req.cookies.session_id || null,
		lang = req.cookies.lang;
	
	if(sessionId !== null) {
		res.clearCookie('session_id');
		res.clearCookie('user_is_signed_in');
		
		session.remove(sessionId).then(() => {
			res.send({ok: 1});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else {
		res.send({error: LANG_LABELS.sign_outed[lang]});
	}
};

const register = (req: Request, res: Response) => {
	let lang = req.cookies.lang,
		error = [],
		{first_name, last_name, middle_name, password, email} = req.body;
		
	middle_name = middle_name || '';
	email = email.toLowerCase();
	if(first_name === '') {
		error.push(LANG_LABELS.r_first_name[lang]);
	}
	if(last_name === '') {
		error.push(LANG_LABELS.r_last_name[lang]);
	}
	if(email === '') {
		error.push(LANG_LABELS.r_email[lang]);
	}else if(!helper.validEmail(email)) {
		error.push(LANG_LABELS.w_email[lang]);
	}
	if(password === '') {
		error.push(LANG_LABELS.r_password[lang]);
	}else if(!(password.match(/[a-z]+/i) && password.match(/\d+/) && password.length >= 10 && !password.match(/\s/))) {
		error.push(LANG_LABELS.w_password[lang]);
	}
	
	if(error.length) {
		return res.send({error: error});
	}else {
		sql.executeQuery('select', 'user', { email: email }).then((promise: QueryResponse) => {
			let user = (promise.data && promise.data[0]) || null;
			if(user !== null) {
				res.send({error: LANG_LABELS.email_exist[lang]});
			}else {
				sql.executeStmt('insert into user (first_name, last_name, middle_name, password, email, active, create_time, edit_time) values (?, ?, ?, ?, ?, ?, now(), now())', [first_name, last_name, middle_name, helper.siteEncryption(email, password), email, 1]).then((promise: QueryResponse) => {
					res.send(promise.error ? {error: promise.error} : {message: LANG_LABELS.account_done[lang]});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}
};

const forgetPassword = (req: Request, res: Response) => {
	let email = req.body.email.toLowerCase(),
		lang = req.cookies.lang,
		error = null,
		user: UserSession | null = null;

	if(email === '') {
		error = LANG_LABELS.r_email[lang];
	}else if(!helper.validEmail(email)) {
		error = LANG_LABELS.w_email[lang];
	}

	if(error) {
		res.send({error: error});
	}else {
		sql.executeQuery('select', 'user', { email: email }).then((promise: QueryResponse) => {
			user = (promise.data && promise.data[0] as UserSession) || null;
			if(user === null) {
				return res.send({error: LANG_LABELS.email_not_found[lang]});
			}else {
				const account = user;
				let accCode = helper.uuid();
				sql.executeQuery('update', 'user', { id: account.id }, { acc_code: accCode }).then((promise: QueryResponse) => {
					if(promise.error) {
						return res.send({error: promise.error});
					}else {
						mail.subject(LANG_LABELS.set_pwd_sub[lang]);
						mail.to(email);
						mail.html(helper.replace(template.get(`reset_password_email_${lang}`), {
							acc_code: accCode,
							first_name: account.first_name,
							domain: (content.get('site_config') as SiteConfig).domain
						}));
						mail.send().then((response: MailResponse) => {
							res.send(response.success ? {message: LANG_LABELS.reset_link_sent[lang]} : {error: response.error || LANG_LABELS.unknown_error[lang]});
						}).catch(() => {
							res.send({error: LANG_LABELS.unknown_error[lang]});
						});						
					}
				}).catch((e) => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});		
	}
};

const resetPassword = (req: Request, res: Response) => {
	let lang = req.cookies.lang,
		password = req.body.new_password,
		confirmPassword = req.body.confirm_new_password,
		accCode = req.body.acc_code,
		error = [];

	if(password === '') {
		error.push(LANG_LABELS.r_password[lang]);
	}else if(!(password.match(/[a-z]+/i) && password.match(/\d+/) && password.length >= 10 && !password.match(/\s/))) {
		error.push(LANG_LABELS.w_password[lang]);
	}else if(password !== confirmPassword) {
		error.push(LANG_LABELS.w_pwd_no_match[lang]);
	}

	if(error.length) {
		res.send({error: error});
	}else {
		if(accCode.match(/(:?cn|en)$/)) {
			accCode = accCode.replace(/(:?cn|en)$/, '');
		}
		sql.executeQuery('select', 'user', { acc_code: accCode }).then(promise => {
			let user = (promise.data && promise.data[0] as UserSession) || null;
			if(user === null) {
				return res.send({error: LANG_LABELS.wrong_url_param[lang]});
			}else {
				sql.executeQuery('update', 'user', { id: user.id }, { acc_code: '', password: helper.siteEncryption(user.email, password) }).then((_promise: QueryResponse) => {
					res.send({message: LANG_LABELS.pwd_reseted[lang]});
				}).catch((e) => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}
		}).catch((e) => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});		
	}
};

const workUserData = (req: Request, res: Response) => {
	let action = req.body.action,
		lang = req.cookies.lang,
		error = [],
		user: UserSession | null = (session.exist(req.cookies.session_id) && session.get(req.cookies.session_id!, 'user') as UserSession) || null;

	if(user === null) {
		res.send({error: LANG_LABELS.sign_outed[lang]});
		return;
	}
	const currentUser = user;
		
	if(action === 'delete_user_advertise') {
		config.deleteAdvertise(req.body.advertise_id).then(success => {
			res.send({ok: 1});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});		
	}else if(action === 'fetch_user_profile') {
		res.send({user: user});
	}else if(action === 'fetch_user_ads') {
		sql.executeQuery('select id,name,viewed,description,is_free,price from advertise where user_id=? and active=1 order by create_time desc', [currentUser.id]).then(promise => {
			let ads = promise.data || [];
			ads.forEach(ad => {
				ad.description = ad.description.toString();
			});
			res.send({ads: ads});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_user_ad') {
		if(req.body.advertise_id !== undefined) {
			userAdvertiseDetail(req, res, [1, currentUser.id, req.body.advertise_id]);
		}else {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		}
	}else if(action === 'change_user_profile') {
		const firstName = (req.body.first_name || '').trim(),
			lastName = (req.body.last_name || '').trim(),
			password = req.body.password;

		if(firstName === '') {
			error.push(LANG_LABELS.r_first_name[lang]);
		}
		if(lastName === '') {
			error.push(LANG_LABELS.r_last_name[lang]);
		}
		if(password !== '' && !(password.match(/[A-Z]+/) && password.match(/[a-z]+/) && password.match(/\d+/) && password.length >= 10 && !password.match(/\s/))) {
			error.push(LANG_LABELS.w_password[lang]);
		}

		if(error.length) {
			res.send({error: error});
		}else {
			let update: Partial<UserSession> & Record<string, unknown> = {first_name: firstName, last_name: lastName};
			if(password !== '') {
				update.password = helper.siteEncryption(currentUser.email, password);
			}
			const updatedUser = {...currentUser, ...update};
			confidentialize(updatedUser);
			session.set(req.cookies.session_id, {user: updatedUser}).then(() => {
				sql.executeQuery('update', 'user', {id: currentUser.id}, update).then(promise => {
					res.send(promise.ok ? {message: LANG_LABELS.edit_profile_done[lang]} : {error: promise.error});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			});
		}
	}else {
		res.end();
		return;
	}
};

const workVisitorData = (req: Request, res: Response) => {
	let lang = req.cookies.lang,
		visitor: VisitorSession | null = (session.exist(req.cookies.session_id) && session.get(req.cookies.session_id!, 'visitor') as VisitorSession) || null;

	if(!visitor) {
		return res.send({error: LANG_LABELS.visitor_in_err[lang]});
	}
	
	config.deleteAdvertise(visitor.v_ad_id).then(success => {
		session.remove(req.cookies.session_id, ['visitor']).then(() => {;
			res.send({ok: 1});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});		
};

const fetchVisitorAdvertise = (req: Request, res: Response) => {
	let lang = req.cookies.lang,
		visitor: VisitorSession | null = (session.exist(req.cookies.session_id) && session.get(req.cookies.session_id!, 'visitor') as VisitorSession) || null;
		
	if(visitor) {
		userAdvertiseDetail(req, res, [1, visitor.v_user_id, visitor.v_ad_id]);
	}else {
		res.send(LANG_LABELS.unknown_error[lang]);
	}		
};

exports.signIn = signIn;
exports.signOut = signOut;
exports.register = register;
exports.forgetPassword = forgetPassword;
exports.resetPassword = resetPassword;
exports.workUserData = workUserData;
exports.workVisitorData = workVisitorData;
exports.fetchVisitorAdvertise = fetchVisitorAdvertise;
