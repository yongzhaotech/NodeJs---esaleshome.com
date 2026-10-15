'use strict';
import type { Connection, QueryError, QueryResult, QueryValues } from 'mysql2';

require('dotenv').config();

const MYSQL = require('mysql2'),
	SQL: Connection = MYSQL.createConnection({
		host: process.env.HOST,
		user: process.env.USER,
		password: process.env.PASSWORD,
		database: process.env.DATABASE
	});

interface FetchSuccess {
	data: QueryResult;
}

interface FetchFailure {
	error: QueryError;
}

interface ExecuteSuccess {
	ok: number;
	key?: number | null;
}

interface ExecuteFailure {
	error: string[];
}

type FetchResponse = FetchSuccess | FetchFailure;
type ExecuteResponse = ExecuteSuccess | ExecuteFailure;
type SqlClause = Record<string, QueryValues> | string | QueryValues[] | undefined;
type ExecuteData = string[] | Record<string, QueryValues>;

const logDatabaseError = (message: string, error: QueryError): void => {
	console.error(`${message}: ${error.code || error.message}`);
};

SQL.connect(error => {
	if(error) {
		logDatabaseError('MySQL connection failed', error);
	}
});

setInterval(() => {
	SQL.query('select 1', error => {
		if(error) {
			logDatabaseError('MySQL keepalive failed', error);
		}
	});
}, 60000);

const sqlError = (error: QueryError): string[] => {
	return Object.keys(error).filter(key => {
		return key.match(/^(code)|(syscall)$/i);
	}).map(key => `${key}: ${(error as QueryError & Record<string, unknown>)[key]}`);
};

const _fetch = (stmt: string, bind: QueryValues): Promise<FetchResponse> => {
	return new Promise(resolve => {
		SQL.query(stmt, bind, (error: QueryError | null, result: QueryResult) => {
			if(error) {
				resolve({error: error});
			}else {
				resolve({data: result});
			}
		});
	});
};

const _sqlFetch = (table: string, clause?: SqlClause, columns?: string[]): Promise<FetchResponse> => {
	let stmt = '',
		clauseObject: string[] = [],
		bindObject: QueryValues[] = [];

	table = table.replace(/\s+$/, '').replace(/^\s+/, '');

	if(table.match(/^[a-z][a-z0-9_]*$/i)) {
		stmt = (columns && Array.isArray(columns)) ? `select ${columns.join(',')} from ${table}` : `select * from ${table}`;
	}else if(table.match(/[ ,]/)) {
		let select = table.match(/^select/i) ? '' : 'select ';
		stmt = `${select}${table}`;
	}

	if(clause && typeof clause === 'object' && !Array.isArray(clause)) {
		Object.keys(clause).sort((a, b) => Number(a) - Number(b)).forEach(key => {
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

const _sqlExecute = (stmt: string, bind: QueryValues): Promise<ExecuteResponse> => {
	return new Promise(resolve => {
		SQL.query(stmt, bind, (error: QueryError | null, result: QueryResult) => {
			if(error) {
				resolve({error: sqlError(error)});
			}else {
				const response: ExecuteSuccess = {ok: 1};
				if(stmt.match(/^insert/i)) {
					response.key = 'insertId' in result ? result.insertId || null : null;
				}
				resolve(response);
			}
		});
	});
};
	
const executeQuery = (command: string, table: string | QueryValues[], clause?: SqlClause, data?: ExecuteData): Promise<FetchResponse | ExecuteResponse> | undefined => {
	if(command.match(/^select/i)) {
		return Array.isArray(table) ? _fetch(command, table) : _sqlFetch(table, clause, Array.isArray(data) ? data : undefined);
	}else if(command.match(/^update$/i)) {
		if(!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
			return;
		}
		const updateData = data as Record<string, QueryValues>;
		const clauseData = clause as Record<string, QueryValues>;
		
		let setsObject: string[] = [],
			clauseObject: string[] = [],
			bindObject: QueryValues[] = [],
			stmt: string;
			
		Object.keys(updateData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
			setsObject.push(`${key} = ?`);
			bindObject.push(updateData[key]);
		});
		
		Object.keys(clauseData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
			clauseObject.push(`${key} = ?`);
			bindObject.push(clauseData[key]);
		});
		
		stmt = `update ${table} set ${setsObject.join(',')} where ${clauseObject.join(' and ')}`;
		return _sqlExecute(stmt, bindObject);
	}else if(command.match(/^insert$/i)) {
		if(!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
			return;
		}
		const insertData = data as Record<string, QueryValues>;

		let placeHolder: string[] = [],
			columnObject: string[] = [],
			bindObject: QueryValues[] = [],
			stmt: string;
			
		Object.keys(insertData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
			columnObject.push(key);
			placeHolder.push('?');
			bindObject.push(insertData[key]);
		});
		
		stmt = `insert into ${table} ${columnObject.join(',')} values (${placeHolder.join(',')})`;
		return _sqlExecute(stmt, bindObject);		
	}else if(command.match(/^delete$/i)) {
		let clauseObject: string[] = [],
			bindObject: QueryValues[] = [],
			stmt: string;
		const clauseData = clause as Record<string, QueryValues>;

		Object.keys(clauseData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
			clauseObject.push(`${key} = ?`);
			bindObject.push(clauseData[key]);
		});

		stmt = clauseObject.length ? `delete from ${table} where ${clauseObject.join(' and ')}` : `delete from ${table}`;
		return _sqlExecute(stmt, bindObject);			
	}
};

const executeStmt = (stmt: string, bind: QueryValues): Promise<ExecuteResponse> => {
	return _sqlExecute(stmt, bind);
};

export { SQL as handle, executeStmt, executeQuery };
