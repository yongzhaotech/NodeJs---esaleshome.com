'use strict';

const helper = require('./helper'),
	sql = require('./sql-engine');
	
let sessionObject = require('./session-object');
	
const exist = (sessionId = null) => sessionId !== null && (sessionId in sessionObject);

const create = (sessionId = null) => {
		console.log(sessionObject);

	if(sessionId === null) {
		const id = helper.uuid();
		sessionObject = { ...sessionObject, ...{ [id]: { data: {}, time: Date.now() } } };

		return new Promise((res, rej) => {
			sql.handle.query('insert into nodesession (id, data, time) values (?, ?, ?)', [id, JSON.stringify(sessionObject[id].data), sessionObject[id].time], (error, result) => {
				if(error) {
					delete sessionObject[id];
					rej({error: error});
				}else {
					res({sessionId: id});
				}
			});
		});
	}else {
		return new Promise((res, rej) => {
			sql.handle.query('select * from nodesession where id = ?', [sessionId], (error, result) => {
				if(error) {
					rej({error: error});
				}else {
					sessionObject = { ...sessionObject, ...{ [sessionId]: { data: JSON.parse(result[0].data), time: result[0].time } } };
					sessionObject.time = result[0].time;
					sessionObject.data = JSON.parse(result[0].data);
					res({sessionId: sessionId});
				}
			});
		});
	}
};

const set = (sessionId, hashObject) => {
	return new Promise((res, rej) => {
		let staleData = sessionObject[sessionId].data,
			newData = {...staleData, ...hashObject},
			time = Date.now();
		sql.handle.query('update nodesession set data = ?, time = ? where id = ?', [JSON.stringify(newData), time, sessionId], (error, result) => {
			if(error) {
				rej({error: error});
			}else {
				sessionObject[sessionId].time = time;
				sessionObject[sessionId].data = newData;
				res({ok: true});
			}
		});
	});
};

const get = (sessionId, key) => sessionObject[sessionId].data && sessionObject[sessionId].data[key] || null;

const remove = (sessionId, items = null) => {
	return new Promise((res, rej) => {
		if(items === null) {
			sql.handle.query('delete from nodesession where id = ?', [sessionId], (error, result) => {
				if(error) {
					rej({error: error});
				}else {
					res({ok: true});
					delete sessionObject[sessionId];
				}
			});			
		}else {
			let dbAction = false;
			items.forEach(key => {
				if(sessionObject[sessionId].data[key]) {
					delete sessionObject[sessionId].data[key];
					dbAction = true;
				}
			});
			if(dbAction) {
				let time = Date.now();
				sql.handle.query('update nodesession set data = ?, time = ? where id = ?', [JSON.stringify(sessionObject[sessionId].data), time, sessionId], (error, result) => {
					if(error) {
						rej({error: error});
					}else {
						sessionObject[sessionId].time = time;
						res({ok: true});
					}
				});
			}
		}
	});
};

const expire = sessionId => Date.now() - +sessionObject[sessionId].time > 1800000;

const update = sessionId => {
	let time = Date.now();
	return new Promise((res, rej) => {
		sql.handle.query('update nodesession set time = ? where id = ?', [time, sessionId], (error, result) => {
			if(error) {
				rej({error: error});
			}else {
				sessionObject[sessionId].time = time;
				res({ok: true});
			}
		}); 
	});
};

exports.exist = exist;
exports.create = create;
exports.set = set;
exports.get = get;
exports.remove = remove;
exports.expire = expire;
exports.update = update;
