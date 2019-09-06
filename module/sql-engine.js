'use strict';
require('dotenv').config();

let MYSQL = require('mysql'),
	SQL = MYSQL.createConnection({
		host: process.env.HOST,
		user: process.env.USER,
		password: process.env.PASSWORD,
		database: process.env.DATABASE
	});

SQL.connect(error => {
	if(error) {}
});

setInterval(() => {
    SQL.query('select 1');
}, 60000);

const sqlError = error => {
	return Object.keys(error).filter(key => {
		return key.match(/^(code)|(syscall)$/i);
	}).map(key => `${key}: ${error[key]}`);
};

const _fetch = (stmt, bind) => {
	return new Promise((res, rej) => {
		SQL.query(stmt, bind, (error, result) => {
			if(error) {
				res({error: error});
			}else {
				res({data: result});
			}
		});
	});
};

const _sqlFetch = (table, clause, columns) => {
	let stmt = '',
		clauseObject = [],
		bindObject = [];

	table = table.replace(/\s+$/, '').replace(/^\s+/, '');

	if(table.match(/^[a-z][a-z0-9_]*$/i)) {
		stmt = (columns && Array.isArray(columns)) ? `select ${columns.join(',')} from ${table}` : `select * from ${table}`;
	}else if(table.match(/[ ,]/)) {
		let select = table.match(/^select/i) ? '' : 'select ';
		stmt = `${select}${table}`;
	}

	if(clause && typeof clause === 'object' && !Array.isArray(clause)) {
		Object.keys(clause).sort((a, b) => a - b).forEach(key => {
			clauseObject.push(`${key} = ?`);
			bindObject.push(clause[key]);
		});
	}

	if(clauseObject.length || (clause && typeof clause === 'string')) {
		stmt = clauseObject.length ? `${stmt} where ${clauseObject.join(' AND ')}` : `${stmt} where ${clause}`;
	}else if(Array.isArray(clause)) {
		bindObject = clause;
	}

	return _fetch(stmt, bindObject);
};

const _sqlExecute = (stmt, bind) => {
	return new Promise((res, rej) => {
		SQL.query(stmt, bind, (error, result) => {
			if(error) {
				res({error: sqlError(error)});
			}else {
				let response = {ok: 1};
				if(stmt.match(/^insert/i)) {
					response.key = result.insertId || null;
				}
				res(response);
			}
		});
	});
};
	
const executeQuery = (command, table, clause, data) => {
	if(command.match(/^select/i)) {
		return Array.isArray(table) ? _fetch(command, table) : _sqlFetch(table, clause, data);
	}else if(command.match(/^update$/i)) {
		if(!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
			return;
		}
		
		let setsObject = [],
			clauseObject = [],
			bindObject = [],
			stmt;
			
		Object.keys(data).sort((a, b) => a - b).forEach(key => {
			setsObject.push(`${key} = ?`);
			bindObject.push(data[key]);
		});
		
		Object.keys(clause).sort((a, b) => a - b).forEach(key => {
			clauseObject.push(`${key} = ?`);
			bindObject.push(clause[key]);
		});
		
		stmt = `update ${table} set ${setsObject.join(',')} where ${clauseObject.join(' and ')}`;
		return _sqlExecute(stmt, bindObject);
	}else if(command.match(/^insert$/i)) {
		if(!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
			return;
		}

		let placeHolder = [],
			columnObject = [],
			bindObject = [],
			stmt;
			
		Object.keys(data).sort((a, b) => a - b).forEach(key => {
			columnObject.push(key);
			placeHolder.push('?');
			bindObject.push(data[key]);
		});
		
		stmt = `insert into ${table} ${columnObject.join(',')} values (${placeHolder.join(',')})`;
		return _sqlExecute(stmt, bindObject);		
	}else if(command.match(/^delete$/i)) {
		let clauseObject = [],
			bindObject = [],
			stmt;

		Object.keys(clause).sort((a, b) => a - b).forEach(key => {
			clauseObject.push(`${key} = ?`);
			bindObject.push(clause[key]);
		});

		stmt = clauseObject.length ? `delete from ${table} where ${clauseObject.join(' and ')}` : `delete from ${table}`;
		return _sqlExecute(stmt, bindObject);			
	}
};

const executeStmt = (stmt, bind) => {
	return _sqlExecute(stmt, bind);
};

exports.handle = SQL;
exports.executeStmt = executeStmt;
exports.executeQuery = executeQuery;
