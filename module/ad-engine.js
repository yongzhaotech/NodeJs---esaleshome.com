'use strict';

const LANG_LABELS = require('../js/language').label(),
	config = require('./ad-config'),
	sql = require('./sql-engine'),
	helper = require('./helper'),
	content = require('../js/static-content'),
	session = require('./session');

const processAdvertise = ad => {
	if(ad.picture_ids === null) {
		ad.picture_id = 0;
		ad.picture_ids = [];
		ad.main_picture_id = '';
	}else {
		let pictures = {},
			mainPictureId = null,
			pictureInfo = ('' + ad.picture_ids).split(',');

		pictureInfo.forEach(picture => {
			let [id, isMain, editTime] = picture.split(' ');
			if(isMain) {
				mainPictureId = id;
			}
			pictures[id] = editTime;
		});

		let picturesArr = Object.keys(pictures).sort((a, b) => b - a);

		if(!mainPictureId) {
			mainPictureId = picturesArr[0];
		}
		ad.picture_id = mainPictureId;
		ad.picture_ids = picturesArr;
		ad.number_of_pictures = picturesArr.length;
		ad.main_picture_id = mainPictureId;
	}
	if(ad.province_id) { ad.province_id = ad.province_id.toString(); }
	if(ad.city_id) { ad.city_id = ad.city_id.toString(); }
	if(ad.category_id) { ad.category_id = ad.category_id.toString(); }
	if(ad.item_id) { ad.item_id = ad.item_id.toString() ;}
	ad.province = { en: content.get('all_provinces')[ad.province_id]['name_en'], cn: content.get('all_provinces')[ad.province_id]['name_cn'], };
	ad.city = { en: content.get('all_cities')[ad.city_id]['name_en'], cn: content.get('all_cities')[ad.city_id]['name_cn'] };
	ad.price_display = {
		en: ad.currency && +ad.price ? LANG_LABELS[`currency_${ad.currency}`].en + helper.dollarValue(ad.price) : LANG_LABELS.c_free_offer.en,
		cn: ad.currency && +ad.price ? LANG_LABELS[`currency_${ad.currency}`].cn + helper.dollarValue(ad.price) : LANG_LABELS.c_free_offer.cn
	};
	if(ad.description) { ad.description = ad.description.toString(); }	
};
	
const detail = (req, res) => {	
	let {advertise_id: advertiseId} = req.body;

	sql.handle.query('select * from advertise where id = ?', [advertiseId], (error, ads) => {
		if(error) {
			res.send({error: error});
		}
		
		let advertise = ads[0] || null;

		if(!advertise) {
			res.send({error: LANG_LABELS.no_sch_result[req.cookies.lang]});
		}else {
			let json = {},
				terms = [],
				desc = advertise.description.toString();
			json.location = !!advertise.address ? {en: advertise.address, cn: advertise.address} : {en: LANG_LABELS.no_addr.en, cn: LANG_LABELS.no_addr.cn};
			json.ad_description = !helper.isNothing(desc) ? {en: desc, cn: desc} : {en: LANG_LABELS.r_no_description.en, cn: LANG_LABELS.r_no_description.cn};
			json.province = {en: content.get('all_provinces')[advertise.province_id]['name_en'], cn: content.get('all_provinces')[advertise.province_id]['name_cn']};
			json.city = {en: content.get('all_cities')[advertise.city_id]['name_en'], cn: content.get('all_cities')[advertise.city_id]['name_cn']};
			json.category = {en: content.get('all_categories')[advertise.category_id]['name_en'], cn: content.get('all_categories')[advertise.category_id]['name_cn']};
			json.item = {en: content.get('all_items')[advertise.item_id]['name_en'], cn: content.get('all_items')[advertise.item_id]['name_cn']};
			if(advertise.currency) {
				json.price_display = {en: LANG_LABELS[`currency_${advertise.currency}`].en + helper.dollarValue(advertise.price), cn: LANG_LABELS[`currency_${advertise.currency}`].cn + helper.dollarValue(advertise.price)};
			}

			terms.push({ text: {en: content.get('all_provinces')[advertise.province_id]['name_en'], cn: content.get('all_provinces')[advertise.province_id]['name_cn']}, key: 'province', id: advertise.province_id });
			terms.push({ text: {en: content.get('all_cities')[advertise.city_id]['name_en'], cn: content.get('all_cities')[advertise.city_id]['name_cn']}, key: 'city', id: advertise.city_id });
			terms.push({ text: {en: content.get('all_categories')[advertise.category_id]['name_en'], cn: content.get('all_categories')[advertise.category_id]['name_cn']}, key: 'category', id: advertise.category_id });
			terms.push({ text: {en: content.get('all_items')[advertise.item_id]['name_en'], cn: content.get('all_items')[advertise.item_id]['name_cn']}, key: 'item', id: advertise.item_id });
			terms.push({ text: {en: advertise.name || '', cn: advertise.name || ''}, key: 'ad_keyword' });
			json.item = {
				pr: advertise.province_id.toString(),
				ct: advertise.city_id.toString(),
				ca: advertise.category_id.toString(),
				it: advertise.item_id.toString(),
				kw: advertise.name	
			};
			json.item.kw = json.item.kw.replace(/'/g, "\\'");
			json.search_terms = terms;
			json.is_free = advertise.is_free;
			json.name = advertise.name;
			json.contact_phone = advertise.contact_phone;
			json.contact_method = advertise.contact_method;
			json.id = advertise.id;
			
			sql.handle.query('select * from picture where advertise_id = ? order by edit_time desc', [advertiseId], (error, pictureSet) => {
				if(error) {
					res.send({error: error});
				}
				
				let pictures = [],
					main_pict = null;

				pictureSet.forEach($_ => {
					pictures.push($_);
					if($_.is_main) {
						main_pict = $_;
					}
				});
				
				let main_picture = main_pict ? main_pict : pictures[0];
				if(!main_picture) {
					main_picture = { id: 0 };
				}
				
				json.main_picture = main_picture.id;
				json.picture_ids = pictures.map(pic => ({i: pic.id}));
				
				res.send(json);
			});
		}
	});
};

const search = (req, res) => {
	let [keyword, category, item, province,	city, start] = [req.body.ad_keyword || '', req.body.category || '', req.body.item || '', req.body.province || '', req.body.city || '', req.body.start || ''], 
		ads = [],
    	criteria = '',
    	clauseObj = {}, 
    	clauseArr  = [],
    	bind = [], 
    	terms = [], 
    	keywords = '',
		stmt,
		countStmt,
		response = {};
	start = start || 0;

	let searchRange = `limit ${start},${content.get('site_config').page_size}`;
	
    if(province !== '') {
        clauseObj['a.province_id'] = province;
        terms.push({ text: {en: content.get('all_provinces')[province]['name_en'],cn: content.get('all_provinces')[province]['name_cn']}, key: 'province', id: province }); 
    }   
    if(city !== '') {
        clauseObj['a.city_id'] = city;
        terms.push({ text: {en: content.get('all_cities')[city]['name_en'], cn: content.get('all_cities')[city]['name_cn']}, key: 'city', id: city }); 
    }   
    if(category !== '') {
        clauseObj['a.category_id'] = category;
        terms.push({ text: {en: content.get('all_categories')[category]['name_en'], cn: content.get('all_categories')[category]['name_cn']}, key: 'category', id: category }); 
    }   
    if(item !== '') {
        clauseObj['a.item_id'] = item;
        terms.push({ text: {en: content.get('all_items')[item]['name_en'], cn: content.get('all_items')[item]['name_cn']}, key: 'item', id: item }); 
    }   
    if(keyword !== '') {
        let keywordClause = keyword.replace(/'/g, "\\'");
		
		if(req.body.searchByKeyword) {
			searchRange = '';
			let keyWordTerms = [
					`(a.name regexp '${keywordClause}' or a.description regexp '${keywordClause}')`,
					`(a.province_id in (select id from province where (province regexp '${keywordClause}' or province_cn regexp '${keywordClause}')))`,
					`(a.city_id in (select id from city where (city regexp '${keywordClause}' or city_cn regexp '${keywordClause}')))`,
					`(a.category_id in (select id from category where (name regexp '${keywordClause}' or name_cn regexp '${keywordClause}')))`,
					`(a.item_id in (select id from item where (name regexp '${keywordClause}' or name_cn regexp '${keywordClause}')))`				
				];
			keywords = `(${keyWordTerms.join(' or ')})`;
		}else {
			keywords = `(a.name regexp '${keywordClause}' or a.description regexp '${keywordClause}')`;
			terms.push({ text: {en: keyword, cn: keyword}, key: 'ad_keyword' }); 			
		}
    }   
	Object.keys(clauseObj).forEach(key => {
        clauseArr.push(`${key} = ?`);
        bind.push(clauseObj[key]);
    });
	if(keywords) {
    	clauseArr.push(keywords);
	}
    criteria = clauseArr.join(' and ');
	if(criteria) {
    	criteria += ' and '; 
	}

    stmt = ` 
        select a.id as 'id',a.name as 'name',a.html as 'html',a.description as 'description',a.is_free,a.price,a.currency,p.ids as 'picture_ids',a.city_id as 'city_id',a.province_id as 'province_id',cast(date(a.create_time) as char) as 'create_date',a.viewed as 'viewed',a.contact_method as 'contact_method',a.contact_phone as 'contact_phone',a.contact_email as 'contact_email'
        from advertise a left outer join (
        select advertise_id,group_concat(concat(id,' ',is_main,' ',edit_time) separator ',') as 'ids' from picture group by advertise_id
        ) p
        on a.id=p.advertise_id
        where ${criteria} a.active=1
        order by a.create_time desc
        ${searchRange}
    `;
    countStmt = `
        select count(a.id) as 'total'
        from advertise a where
        ${criteria} a.active=1
    `;

    response.item = {
        pr: province,
        ct: city,
        ca: category,
        it: item,
        kw: keyword.replace(/'/g, "\\'")
    };

	sql.handle.query(stmt, bind, (error, resultSet) => {
		if(error) {
			res.send({error: error});
		}else {
			resultSet.forEach(ad => {
				processAdvertise(ad);
				ads.push(ad);
			});

			if(!ads.length) {
				res.send({error: LANG_LABELS.no_sch_result[req.cookies.lang]});
			}else {
				sql.handle.query(countStmt, bind, (error, resultSet) => {
					if(error) {
						res.send({error: error});
					}else {
						let total = resultSet[0].total;
						response.angular_ads = ads;
						response.angular_ad_pages = req.body.searchByKeyword ? [] : helper.calculatePages(start, total, {s: 1});
						response.search_terms = terms;
						res.send(response);
					}
				});
			}
		}
	});
};

const lists = (req, res) => {
	let start = req.body.start || 0,
		bind = [1],
		stmt,
		countStmt;

	stmt = `
		select a.id as 'id',a.name as 'name',a.html as 'html',a.address as 'address',a.description as 'description',a.is_free,a.currency,a.price,a.contact_method as 'contact_method',a.contact_email as 'contact_email',a.contact_phone as 'contact_phone',a.city_id as 'city_id',a.province_id as 'province_id',cast(date(a.create_time) as char) as 'create_date',a.item_id as 'item_id',a.category_id as 'category_id',a.viewed as 'viewed',p.ids as 'picture_ids'
		from advertise a left outer join (
			select advertise_id,group_concat(concat(id,' ',is_main,' ',edit_time) separator ',') as 'ids' from picture group by advertise_id
		) p
		on a.id=p.advertise_id
		where a.active=?
		order by a.create_time desc
		limit ${start},${content.get('site_config').page_size}
	`;
    countStmt = `
        select count(a.id) as 'total'
        from advertise a
        where a.active=?
    `;

	sql.handle.query(stmt, bind, (error, ads) => {
		if(error) {
			res.send({error: error});
		}else {
			let advertises = [];
			
			ads.forEach(ad => {
				processAdvertise(ad);
				advertises.push(ad);
			});
			if(!advertises.length) {
				res.send({error: LANG_LABELS.no_sch_result[req.cookies.lang]});
			}else {
				sql.handle.query(countStmt, bind, (error, resultSet) => {
					if(error) {
						res.send({error: error});
					}else {
						let total = resultSet[0].total,
							response = {
								ads: {
									angular_ads: advertises,
									angular_ad_pages: helper.calculatePages(start, total)
								}
							};
						res.send(response);
					}
				});
			}
		}
	});
};

const postAdvertise = (req, res) => {
	let categoryId = +req.body.category,
		itemId	= +req.body.item,
		name = (req.body.ad_name || '').trim(),
		phone = (req.body.contact_phone || '').trim(),
		email = (req.body.email || '').trim().toLowerCase(),
		isFree = (req.body.is_free || '').trim(), 
		price = +req.body.price || 0.00, 
		currency = (req.body.currency || '').trim(), 
		description	= (req.body.description || '').trim(), 
		address = (req.body.address || '').trim(),
		mainPict = +req.body.main_picture_id, 
		contactMethod = (req.body.contact_method || '').trim(),
		province = +req.body.province,
		city = +req.body.city,
		lang = req.cookies.lang,
		error = [],
		user = session.exist(req.cookies.session_id) && session.get(req.cookies.session_id, 'user') || null;

	if(!categoryId) {
		error.push(LANG_LABELS.r_category[lang]);
	}
	if(!itemId) {
		error.push(LANG_LABELS.r_item[lang]);
	}
	if(name === '') {
		error.push(LANG_LABELS.r_ad_name[lang]);
	}
	if(isFree === '') {
		error.push(LANG_LABELS.r_is_free[lang]);
	}
	if(contactMethod === '') {
		error.push(LANG_LABELS.r_contact_method[lang]);
	}else {
		if(contactMethod.match(/\bcontact_phone\b/) && !helper.validPhone(phone)) {
			error.push(LANG_LABELS.w_contact_phone[lang]);
		}
		if(contactMethod.match(/\bemail\b/) && !helper.validEmail(email)) {
			error.push(LANG_LABELS.w_email[lang]);
		}
	}
	if(!province) {
		error.push(LANG_LABELS.r_province[lang]);
	}
	if(!city) {
		error.push(LANG_LABELS.r_city[lang]);
	}
	
	if(error.length) {
		res.send({error: error});
		return;
	}

	let userId	= user ? user.id : 0,
		postId = user ? '' : ('' + Date.now()).substring(8);
			
	sql.executeStmt('insert into advertise (user_id, category_id, item_id, name, is_free, price, currency, description,	contact_method,	contact_phone, contact_email, main_picture_id, address,	city_id, province_id, active, create_time, post_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,now(),?)', [userId, categoryId, itemId, name, +isFree, price, currency, description, contactMethod, phone, email, mainPict, address, city, province, 1, postId]).then(promise => {
		if(promise.error) {
			res.send({error: promise.error});
		}else {
			let advertiseId = promise.key,
				success = config.processPhoto(req, advertiseId, mainPict);
			Promise.all(success).then(p => {
				let msgs = [`[ ${name} ] ${LANG_LABELS.ad_added[lang]}!`];
				if(postId) {
					let info = {};
					if(phone) { info.phone = phone; }
					if(email) { info.email = email; }
					msgs.push(`${LANG_LABELS.remember[lang]}:`);
					msgs.push(`${LANG_LABELS.post_id[lang]}: ${postId}`);
					Object.keys(info).forEach(key => {
						msgs.push(`${LANG_LABELS[key][lang]}: ${info[key]}`);
					});
				}
				res.send({message: msgs, load: advertiseId});
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});
};

const EditAdvertise = (req, res) => {
	let id			= +req.body.advertise_id,
		category_id = +req.body.category,
		item_id		= +req.body.item,
		name		= (req.body.ad_name || '').trim(),
		email		= (req.body.contact_email || '').trim().toLowerCase(),
		phone		= (req.body.contact_phone || '').trim(),
		is_free		= (req.body.is_free || '').trim(), 
		price		= +req.body.price || 0.00, 
		currency	= (req.body.currency || '').trim(), 
		description	= (req.body.description || '').trim(), 
		address		= (req.body.address || '').trim(),
		main_pict	= +req.body.main_picture_id, 
		contact_method = (req.body.contact_method || '').trim(),
		province	= +req.body.province,
		city		= +req.body.city,
		lang		= req.cookies.lang,
		error		= [],
		user		= session.exist(req.cookies.session_id) && session.get(req.cookies.session_id, 'user') || null;

	if(!category_id) {
		error.push(LANG_LABELS.r_category[lang]);
	}
	if(!item_id) {
		error.push(LANG_LABELS.r_item[lang]);
	}
	if(name === '') {
		error.push(LANG_LABELS.r_ad_name[lang]);
	}
	if(is_free === '') {
		error.push(LANG_LABELS.r_is_free[lang]);
	}
	if(contact_method === '') {
		error.push(LANG_LABELS.r_contact_method[lang]);
	}else {
		if(contact_method.match(/\bcontact_phone\b/) && !helper.validPhone(phone)) {
			error.push(LANG_LABELS.w_contact_phone[lang]);
		}
	}
	if(!province) {
		error.push(LANG_LABELS.r_province[lang]);
	}
	if(!city) {
		error.push(LANG_LABELS.r_city[lang]);
	}

	if(error.length) {
		res.send({error: error});
		return;
	}
	
	config.deletePhoto(req, id, user).then(success => {
		let advertise = {
			category_id: category_id,
			item_id: item_id,
			name: name,
			is_free: +is_free,
			price: price,
			currency: currency,
			description: description,
			contact_method: contact_method,
			contact_phone: phone,
			contact_email: email,
			address: address,
			city_id: city,
			province_id: province
		};
		sql.executeQuery('update', 'advertise', { id: id, user_id: user.id }, advertise).then(success => {
			Promise.all(config.processPhoto(req, id, main_pict)).then(p => {
				res.send({message: LANG_LABELS.c_ad_edit_ok[lang], load: id});
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});
};

const EditVisitorAdvertise = (req, res) => {
	let lang = req.cookies.lang,
		visitor = session.exist(req.cookies.session_id) && session.get(req.cookies.session_id, 'visitor') || null;

	if(!visitor) {
		res.send({error: LANG_LABELS.visitor_in_err[lang]});
	}
	
	let id			= visitor.v_ad_id,
		uid			= visitor.v_user_id,
		post_id		= visitor.v_post_id,
		category_id = +req.body.category,
		item_id		= +req.body.item,
		name		= (req.body.ad_name || '').trim(),
		email		= (req.body.contact_email || '').trim().toLowerCase(),
		phone		= (req.body.contact_phone || '').trim(),
		is_free		= (req.body.is_free || '').trim(), 
		price		= +req.body.price || 0.00, 
		currency	= (req.body.currency || '').trim(), 
		description	= (req.body.description || '').trim(), 
		address		= (req.body.address || '').trim(),
		main_pict	= +req.body.main_picture_id, 
		contact_method = (req.body.contact_method || '').trim(),
		province	= +req.body.province,
		city		= +req.body.city,
		error		= [];

	if(!category_id) {
		error.push(LANG_LABELS.r_category[lang]);
	}
	if(!item_id) {
		error.push(LANG_LABELS.r_item[lang]);
	}
	if(name === '') {
		error.push(LANG_LABELS.r_ad_name[lang]);
	}
	if(is_free === '') {
		error.push(LANG_LABELS.r_is_free[lang]);
	}
	if(contact_method === '') {
		error.push(LANG_LABELS.r_contact_method[lang]);
	}else {
		if(contact_method.match(/\bcontact_phone\b/) && !helper.validPhone(phone)) {
			error.push(LANG_LABELS.w_contact_phone[lang]);
		}
	}
	if(!province) {
		error.push(LANG_LABELS.r_province[lang]);
	}
	if(!city) {
		error.push(LANG_LABELS.r_city[lang]);
	}

	if(error.length) {
		res.send({error: error});
		return;
	}
	
	config.deletePhoto(req, id, visitor).then(success => {
		let advertise = {
			category_id: category_id,
			item_id: item_id,
			name: name,
			is_free: +is_free,
			price: price,
			currency: currency,
			description: description,
			contact_method: contact_method,
			contact_phone: phone,
			contact_email: email,
			address: address,
			city_id: city,
			province_id: province
		};

		sql.executeQuery('update', 'advertise', { id: id, user_id: uid }, advertise).then(success => {
			Promise.all(config.processPhoto(req, id, main_pict)).then(p => {
				let msgs = [`[ ${name} ] ${LANG_LABELS.ad_updated[lang]}!`],
					info = {};
				if(phone) { info.phone = phone; }
				if(email) { info.email = email; }
				msgs.push(`${LANG_LABELS.remember[lang]}:`);
				msgs.push(`${LANG_LABELS.post_id[lang]}: ${post_id}`);
				Object.keys(info).forEach(key => {
					msgs.push(`${LANG_LABELS[key][lang]}: ${info[key]}`);
				});	
				session.remove(req.cookies.session_id, ['visitor']).then(() => {;
					res.send({message: msgs, load: id});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}).catch(() => {
		res.send({error: LANG_LABELS.unknown_error[lang]});
	});
};

exports.processAdvertise = processAdvertise;
exports.detail = detail;
exports.search = search;
exports.lists = lists;
exports.postAdvertise = postAdvertise;
exports.EditAdvertise = EditAdvertise;
exports.EditVisitorAdvertise = EditVisitorAdvertise;
