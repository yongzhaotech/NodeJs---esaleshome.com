import { type Connection, type QueryError, type QueryValues, createConnection } from 'mysql2';



export type DatabaseRow = Record<string, any>;

export type DatabaseRows = DatabaseRow[];

export interface QueryResponse {
    data?: DatabaseRow[];
    ok?: number;
    error?: unknown;
}

export interface DatabaseResponse {
    data?: DatabaseRows;
    ok?: number;
    key?: number | null;
    error?: unknown;
}

export interface SqlHandle {
    query<T extends unknown[] = DatabaseRows>(stmt: string, bind: QueryValues, callback: (error: QueryError | null, rows: T) => void): void;
    query<T extends unknown[] = DatabaseRows>(stmt: string, callback: (error: QueryError | null, rows: T) => void): void;
}

export interface SqlStatement {
    stmt: string;
    bind?: QueryValues;
}

type SqlClause = Record<string, QueryValues> | string | QueryValues[] | undefined;
type ExecuteData = string[] | Record<string, QueryValues>;

const logDatabaseError = (message: string, error: QueryError): void => {
    console.error(`${message}: ${error.code || error.message}`);
};

const sqlError = (error: QueryError): string[] => {
    return Object.keys(error).filter(key => {
        return key.match(/^(code)|(syscall)$/i);
    }).map(key => `${key}: ${(error as QueryError & Record<string, unknown>)[key]}`);
};

class _Mysql {
    #_sql: Connection;
    handle: SqlHandle;

    constructor() {
        this.#_sql = createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });

        this.handle = this.#_sql as unknown as SqlHandle;
        this.#_sql.connect(error => {
            if (error) {
                logDatabaseError('MySQL connection failed', error);
            }
        });

        setInterval(() => {
            this.#_sql.query('select 1', (error: QueryError | null) => {
                if (error) {
                    logDatabaseError('MySQL keepalive failed', error);
                }
            });
        }, 60000);
    }

    #_fetch(stmt: string, bind: QueryValues): Promise<DatabaseResponse> {
        return new Promise(resolve => {
            this.#_sql.query(stmt, bind as QueryValues, (error: QueryError | null, result: any) => {
                if (error) {
                    resolve({ error: error });
                } else {
                    resolve({ data: result });
                }
            });
        });
    }

    #_sqlFetch(table: string, clause?: SqlClause, columns?: string[]): Promise<DatabaseResponse> {
        let stmt = '',
            clauseObject: string[] = [],
            bindObject: QueryValues[] = [];

        table = table.replace(/\s+$/, '').replace(/^\s+/, '');

        if (table.match(/^[a-z][a-z0-9_]*$/i)) {
            stmt = (columns && Array.isArray(columns)) ? `select ${columns.join(',')} from ${table}` : `select * from ${table}`;
        } else if (table.match(/[ ,]/)) {
            let select = table.match(/^select/i) ? '' : 'select ';
            stmt = `${select}${table}`;
        }

        if (clause && typeof clause === 'object' && !Array.isArray(clause)) {
            Object.keys(clause).sort((a, b) => Number(a) - Number(b)).forEach(key => {
                clauseObject.push(`${key} = ?`);
                bindObject.push(clause[key]);
            });
        }

        if (clauseObject.length || (clause && typeof clause === 'string')) {
            stmt = clauseObject.length ? `${stmt} where ${clauseObject.join(' AND ')}` : `${stmt} where ${clause}`;
        } else if (Array.isArray(clause)) {
            bindObject = clause;
        }

        return this.#_fetch(stmt, bindObject);
    }

    #_sqlExecute = (stmt: string, bind: QueryValues): Promise<DatabaseResponse> => {
        return new Promise(resolve => {
            this.#_sql.query(stmt, bind as QueryValues, (error: QueryError | null, result: any) => {
                if (error) {
                    resolve({ error: sqlError(error) });
                } else {
                    const response: DatabaseResponse = { ok: 1 };
                    if (stmt.match(/^insert/i)) {
                        response.key = result && typeof result === 'object' && 'insertId' in result ? Number((result as any).insertId ?? 0) || null : null;
                    }
                    resolve(response);
                }
            });
        });
    }

    executeStmt(stmt: string, bind: QueryValues = []): Promise<DatabaseResponse> {
        return this.#_sqlExecute(stmt, bind);
    }

    executeTransaction(statements: SqlStatement[]): Promise<DatabaseResponse> {
        return new Promise(resolve => {
            this.#_sql.beginTransaction(error => {
                if (error) {
                    resolve({ error: sqlError(error) });
                    return;
                }

                const executeNext = (index: number): void => {
                    if (index >= statements.length) {
                        this.#_sql.commit(error => {
                            if (error) {
                                this.#_sql.rollback(() => resolve({ error: sqlError(error) }));
                            } else {
                                resolve({ ok: 1 });
                            }
                        });
                        return;
                    }

                    const { stmt, bind = [] } = statements[index];
                    this.#_sql.query(stmt, bind, error => {
                        if (error) {
                            this.#_sql.rollback(() => resolve({ error: sqlError(error) }));
                        } else {
                            executeNext(index + 1);
                        }
                    });
                };

                executeNext(0);
            });
        });
    }

    executeQuery(command: string, table: string | QueryValues[], clause?: SqlClause, data?: ExecuteData): Promise<DatabaseResponse> {
        if (command.match(/^select/i)) {
            return Array.isArray(table) ? this.#_fetch(command, table) : this.#_sqlFetch(table, clause, Array.isArray(data) ? data : undefined);
        } else if (command.match(/^update$/i)) {
            if (!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
                return Promise.reject({ error: 'data missing' });
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
            return this.#_sqlExecute(stmt, bindObject);
        } else if (command.match(/^insert$/i)) {
            if (!data || !(data && !Array.isArray(data) && typeof data === 'object') || !Object.keys(data).length) {
                return Promise.reject({ error: 'data missing' });
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
            return this.#_sqlExecute(stmt, bindObject);
        } else if (command.match(/^delete$/i)) {
            let clauseObject: string[] = [],
                bindObject: QueryValues[] = [],
                stmt: string;
            const clauseData = clause as Record<string, QueryValues>;

            Object.keys(clauseData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
                clauseObject.push(`${key} = ?`);
                bindObject.push(clauseData[key]);
            });

            stmt = clauseObject.length ? `delete from ${table} where ${clauseObject.join(' and ')}` : `delete from ${table}`;
            return this.#_sqlExecute(stmt, bindObject);
        }

        return Promise.reject({ error: 'unsupported sql statement' });
    }
}

export const mysql = new _Mysql();
