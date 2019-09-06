'use strict';

const LANG_LABELS = require('../js/language').label(),
	content = require('../js/static-content'),
	fs = require('fs'),
	directory = '../server/js',
	siteMap = '../server/file/sitemap.txt',
	config = require('./ad-config'),
	helper = require('./helper'),
	sql = require('./sql-engine');

const adminFunction = (req, res) => {
	let action = req.body.action || req.body.admin_action,
		start = req.body.start || 0,
		size = content.get('site_config').page_size,
		lang = req.cookies.lang;

	if(action === 'set_permission') {
		let page = req.body.page,
			access_level = req.body.access_level,
			check_ad = req.body.check_ad;
		sql.executeQuery('update', 'site_authenticate', { site: 'advertise', page: page }, { access_level: access_level, check_ad: check_ad }).then(promise => {
			res.send({message: `Permission for '${page}' is changed successfully`});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action.match(/^(de)?activate_ad$/)) {
		let active = RegExp.$1 === 'de' ? 0 : 1,
			result = RegExp.$1 === 'de' ? 'removed from' : 'added to';
		sql.executeQuery('update', 'advertise', { id: req.body.id }, { active: active }).then(promise => {
			res.send({message: `Selected ad is ${result} the list`});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'delete') {
		config.deleteAdvertise(req.body.id).then(success => {
			res.send({ok: 1});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_users') {
		sql.executeQuery('select', `select email,last_name,first_name,create_time,edit_time,signin_count from user order by create_time,edit_time desc limit ${start},${size}`).then(promise => {
			let users = promise.data || null;
			if(users) {
				sql.executeQuery('select', `select count(id) as 'total' from user`).then(promise => {
					res.send({users: users, pages: helper.calculatePages(start, promise.data[0].total)});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}else {
				res.send({error: LANG_LABELS.no_sch_result[lang]});
			}
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_ads') {
		let stmt = `select a.id as 'id',a.name as 'name',a.create_time as 'create_time',a.active as 'active',u.email as 'poster',a.contact_email as 'contact_email',a.contact_phone as 'contact_phone',a.post_id as 'post_id'
				from advertise a,user u
				where a.user_id=u.id
				order by a.create_time desc
				limit ${start},${size}`,
			count_stmt = `
				select count(a.id) as 'total'
				from advertise a,user u
				where a.user_id=u.id`;

		sql.executeQuery('select', stmt).then(promise => {
			let ads = promise.data || [];
			if(ads.length) {
				sql.executeQuery('select', count_stmt).then(promise => {
					res.send({ads: ads, pages: helper.calculatePages(start, promise.data[0].total)});
				}).catch(() => {
					res.send({error: LANG_LABELS.unknown_error[lang]});
				});
			}else {
				res.send({error: LANG_LABELS.no_sch_result[lang]});
			}
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_visitor_hits') {
		let response = {},
			cnt_stmt = `select count(distinct ip) as 'total' from visitor_hits`,
			stmt = `select count(ip) as 'count',ip,cast(max(create_time) as char) as 'create_time',cast(current_date as char) as 'this_day' from visitor_hits group by ip order by create_time desc,count desc limit ${start}, ${size}`;
		sql.executeQuery('select', stmt).then(promise => {
			response.hits = promise.data || [];
			sql.executeQuery('select', cnt_stmt).then(promise => {
				response.pages = helper.calculatePages(start, promise.data[0].total);
				res.send(response);
			}).catch(() => {
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_files') {
		sql.executeQuery('select', 'site_authenticate', { site: 'advertise' }).then(promise => {
			res.send({files: promise.data || []});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_categories') {
		sql.executeQuery('select', 'select * from category order by name').then(promise => {
			let cats = (promise.data || []).map(cat => ({ id: cat.id, name: cat.name, name_cn: cat.name_cn }));
			res.send({categories: cats});
		}).catch(() => {
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'fetch_adm_subcategories') {
		let response = {};
		sql.executeQuery('select', 'select * from category order by name').then(promise => {
			let categories = (promise.data || []).map(cat => ({ id: cat.id, name: cat.name, name_cn: cat.name_cn }));
			response.categories = categories;
			sql.executeQuery('select', 'select * from item order by name').then(promise => {
				let items = (promise.data || []).reduce((current, next) => {
					if(!(next.category_id in current)) {
						current[next.category_id] = [];
					}
					current[next.category_id].push({ id: next.id, name: next.name, name_cn: next.name_cn });
					return current;
				}, {});
				response.items = items;
				response.default_category_id = categories[0].id;
				
				let hash = {category: {}};
				Object.keys(items).forEach(c_id => {
					hash.category[c_id] = [];
					items[c_id].forEach($_ => {
						$_.name = $_.name.replace(/'/g, "\\'");
						$_.name_cn = $_.name_cn.replace(/'/g, "\\'");
						hash.category[c_id].push({i: $_.id, n: $_.name, n_cn: $_.name_cn});
					});
				});
				response.category_list = hash;
				res.send({subCategories: response});
			}).catch((e) => {console.log(e);
				res.send({error: LANG_LABELS.unknown_error[lang]});
			});
		}).catch((e) => {console.log(e);
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
	}else if(action === 'admin_visitor_hits_list') {
		let [stmt, bind] = req.body.visitor_date ? [
				`select substring_index(cast(create_time as char),' ',-1) as 'create_time',uri from visitor_hits WHERE ip=? and create_time regexp ? ORDER BY create_time DESC`, [req.body.visitor_ip, req.body.visitor_date]
			] : [
				`select ips.count,ips.ip,substring_index(ips.ip_visit_date,' ',-1) as 'create_time',dayname(substring_index(ips.ip_visit_date,' ',-1)) as 'week_day' from (select count(ip) as 'count',ip,concat(ip,' ',substr(cast(create_time as char),1,10)) as 'ip_visit_date' from visitor_hits group by ip_visit_date order by ip_visit_date) ips  where ips.ip=? order by create_time desc`, [req.body.visitor_ip]
			];
		
		sql.executeQuery('select', stmt, bind).then(promise => {
			res.send({hits: {lists: (promise.data || []), visitor_date: req.body.visitor_date}});
		}).catch((e) => {console.log(e);
			res.send({error: LANG_LABELS.unknown_error[lang]});
		});
 	}
};

const generateStaticContent = (req, res) => {
	let langLabels = {...LANG_LABELS},
		$categories = {},
		$items = {},
		$all_items = {},
		$$categories = [],
		$states = {},
		$provinces = {}, 
		$countries = {}, 
		$cities = {},
		$all_cities = {}, 
		$$provinces = [],
		$content,
		$js = `const LangMessages=${JSON.stringify(langLabels)};` + `\n` + `export { LangMessages };`,
		$stmt;

	$content = `'use strict';\nconst content = {\n`;

	fs.writeFile(`${directory}/langs.js`, $js, error => {
		if(error) {
			res.send({error: error});
		}
		
		$js = `const page_vars={};page_vars['search_seq']={province:1,city:2,category:3,item:4,ad_keyword:5};page_vars['category']=[`;
		
		$stmt = `
			select c.id as 'cat_id',c.name as 'cat_name',c.name_cn as 'cat_name_cn',i.id as 'i_id',i.name as 'i_name',i.name_cn as 'i_name_cn'
			from category c,item i
			where c.id=i.category_id
			order by c.name,i.name
		`;
		
		sql.handle.query($stmt, (error, dataSet) => {
			if(error) {
				res.send({error: error});
			}
			
			dataSet.forEach($_ => {
				if(!$items[$_.cat_id]) {
					$items[$_.cat_id] = [];
				}
				$categories[$_.cat_id] = { name_en: $_.cat_name, name_cn: $_.cat_name_cn };
				$items[$_.cat_id].push({ id: $_.i_id, name_en: $_.i_name, name_cn: $_.i_name_cn });
				$all_items[$_.i_id] = { name_en: $_.i_name, name_cn: $_.i_name_cn };				
			});

			Object.keys($items).forEach($_ => {
				$items[$_].unshift({ id: '', name_en: 'sub categories under ' + $categories[$_].name_en, name_cn: $categories[$_].name_cn + '分类' });
			});

			$$categories = Object.keys($categories).sort((a, b) => a - b).map($_ => ({ id: $_, name_en: $categories[$_].name_en, name_cn: $categories[$_].name_cn }));
			$$categories.unshift({ id: '', name_en: 'Category', name_cn: '总类' });

			$$categories.forEach($cat_ref => {
				let $cat_id = $cat_ref.id;
				$cat_ref.name_en = $cat_ref.name_en.replace(/'/g, "\\'");
				$cat_ref.name_cn = $cat_ref.name_cn.replace(/'/g, "\\'");
				$js += `{n:{en:'${$cat_ref.name_en}',cn:'${$cat_ref.name_cn}'},i:'${$cat_id}',c:[`;
				($items[$cat_id] || []).forEach($item => {
					$item.name_en = $item.name_en.replace(/'/g, "\\'");
					$item.name_cn = $item.name_cn.replace(/'/g, "\\'");
					$js += `{i:'${$item.id}',n:{en:'${$item.name_en}',cn:'${$item.name_cn}'}},`;
				});
				$js = $js.replace(/,$/, "");
				$js += "]},";
			});
			$js = $js.replace(/,$/, "");
			$js += "];";		
			
			$js += `page_vars['province']=[`;

			$stmt = ` 
				select p.id as 'p_id',p.province as 'p_name',p.province_cn as 'p_name_cn',p.country as 'p_country',p.country_cn as 'p_country_cn',c.id as 'c_id',c.city as 'c_name',c.city_cn as 'c_name_cn'
				from province p,city c
				where p.id=c.province_id
				order by p.country,p.province,c.city
			`;

			sql.handle.query($stmt, (error, dataSet) => {
				if(error) {
					res.send({error: error});
				}

				dataSet.forEach($_ => {
					$states[$_.p_id] = { country_en: $_.p_country, country_cn: $_.p_country_cn };
					if(!$countries[$_.p_country]) {
						$countries[$_.p_country] = [];
					}
					if(!$provinces[$_.p_id]) {
						$countries[$_.p_country].push({ id: $_.p_id, name_en: $_.p_name, name_cn: $_.p_name_cn });
					}
					$provinces[$_.p_id] = { name_en: $_.p_name, name_cn: $_.p_name_cn };
					if(!$cities[$_.p_id]) {
						$cities[$_.p_id] = [];
					}
					$cities[$_.p_id].push({ id: $_.c_id, name_en: $_.c_name, name_cn: $_.c_name_cn }); 
					$all_cities[$_.c_id] = { name_en: $_.c_name, name_cn: $_.c_name_cn };
				});

				Object.keys($cities).forEach($_ => {
					$cities[$_].unshift({ name_en: 'major cities / towns in ' + $provinces[$_].name_en, name_cn: $provinces[$_].name_cn + '中的主要城镇', id: '' }); 
				});

				$content += `\tall_provinces: ${JSON.stringify($provinces)},\n`;
				$content += `\tall_cities: ${JSON.stringify($all_cities)},\n`;
				$content += `\tall_categories: ${JSON.stringify($categories)},\n`;
				$content += `\tall_items: ${JSON.stringify($all_items)},\n`;


				$$provinces = [{ id: '', name_en: 'Province / State', name_cn: '加拿大省或美国州' }];
				Object.keys($countries).sort((a, b) => a - b).forEach($country => {
					let $$arr = $countries[$country].sort((a, b) => a.name_en - b.name_en);
					$$provinces = [...$$provinces, ...$$arr];
				});

				$$provinces.forEach($prov => {
					let $p_id = $prov.id;
					$prov.name_en = $prov.name_en.replace(/'/g, "\\'");
					$prov.name_cn = $prov.name_cn.replace(/'/g, "\\'");
					if($states[$p_id]) {
						$js += `{s:{en:'${$states[$p_id].country_en}',cn:'${$states[$p_id].country_cn}'},n:{en:'${$prov.name_en}',cn:'${$prov.name_cn}'},i:'${$p_id}',c:[`;
					}
					($cities[$p_id] || []).forEach($city => {
						$city.name_en = $city.name_en.replace(/'/g, "\\'");
						$city.name_cn = $city.name_cn.replace(/'/g, "\\'");
						$js += `{i:'${$city.id}',n:{en:'${$city.name_en}',cn:'${$city.name_cn}'}},`;
					});
					$js = $js.replace(/,$/, "");
					$js += "]},";
				});

				$js = $js.replace(/,$/, "");
				$js += "];";
				$js += "\n";
				$js += `const static_vars = {inum:10,imb:7,menus:[{n:"c_account",a:"user-account",b:false},{n:"c_post",a:"post-ad",b:false},{n:"c_search",a:"search",b:true},{n:"c_edit",a:"find_visitor_ad",b:true},{n:"c_contact",a:"contact_us",b:true}]};`;
				$js += "\n";
				$js += "export {page_vars as PageVars, static_vars as StaticVars};";

				fs.writeFile(`${directory}/static-vars.js`, $js, error => {
					if(error) {
						res.send({error: error});
					}

					sql.handle.query(`select * from site_config where site='advertise'`, (error, resultSet) => {
						if(error) {
							res.send({error: error});
						}
						
						if(resultSet[0]) {
							$content += `\tsite_config: ${JSON.stringify(resultSet[0])},\n`;
						}

						sql.handle.query(`select * from site_authenticate where site='advertise'`, (error, resultSet) => {
							if(error) {
								res.send({error: error});
							}

							let $auth = {};							
							resultSet.forEach($_ => {
								$auth[$_.page] = $_;
							});
							$content += `\tsite_authenticate: ${JSON.stringify($auth)}\n`;
							$content += `};\nexports.get = key => content[key] || null;`

							fs.writeFile(`${directory}/static-content.js`, $content, error => {
								if(error) {
									res.send({error: error});
								}

								res.send({ok: 'Static content file generated!'});
							});
						});
					});
				});
			});
		});
	});
};

const generateHtmls = (req, res) => {
	sql.executeQuery('select', 'select id from advertise').then(promise => {
		let idsArray = promise.data || [],
			htmls = idsArray.map(idObject => `http://esaleshome.com/ads/ad-detail/${idObject.id}`);
			fs.writeFile(siteMap, htmls.join('\n'), error => {
			if(error) {
				res.send({error: 'error'});
			}else {
				res.send({ok: 'Static html files generated!'});
			}
		});		
	}).catch(() => {
		res.send({error: 'error'});
	});
};

exports.adminFunction = adminFunction;
exports.generateStaticContent = generateStaticContent;
exports.generateHtmls = generateHtmls;
