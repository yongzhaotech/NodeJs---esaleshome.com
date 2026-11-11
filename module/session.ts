'use strict';

import { mysql as sql } from '../utils';
import { sessionLifeTime } from '../constants';

const helper = require('./helper');

interface SessionEntry {
    data: Record<string, unknown>;
    time: number;
}

interface StoredSessionRow {
    data: string;
    time: number;
}

class SessionStore {
    private readonly sessions = new Map<string, SessionEntry>();

    has(sessionId: string | null): boolean {
        return typeof sessionId === 'string' && this.sessions.has(sessionId);
    }

    create(sessionId: string | null = null): Promise<{ sessionId: string }> {
        if (sessionId === null) {
            const id = helper.uuid();
            const entry: SessionEntry = {
                data: {},
                time: Date.now(),
            };

            this.sessions.set(id, entry);

            return new Promise((resolve, reject) => {
                sql.handle.query(
                    'insert into nodesession (id, data, time) values (?, ?, ?)',
                    [id, JSON.stringify(entry.data), entry.time],
                    (error: Error | null) => {
                        if (error) {
                            this.sessions.delete(id);
                            reject({ error });
                            return;
                        }

                        resolve({ sessionId: id });
                    }
                );
            });
        }

        return new Promise((resolve, reject) => {
            sql.handle.query<StoredSessionRow[]>(
                'select * from nodesession where id = ?',
                [sessionId],
                (error, result = []) => {
                    if (error) {
                        reject({ error });
                        return;
                    }

                    const row = result[0];
                    if (!row) {
                        reject({ error: new Error('Session not found') });
                        return;
                    }

                    this.sessions.set(sessionId, {
                        data: this.parseSessionData(row.data),
                        time: row.time,
                    });

                    resolve({ sessionId });
                }
            );
        });
    }

    set(sessionId: string, hashObject: Record<string, unknown>): Promise<{ ok: true }> {
        const entry = this.sessions.get(sessionId);

        if (!entry) {
            return Promise.reject({ error: new Error('Session not found') });
        }

        const newData = { ...entry.data, ...hashObject };
        const time = Date.now();

        return new Promise((resolve, reject) => {
            sql.handle.query(
                'update nodesession set data = ?, time = ? where id = ?',
                [JSON.stringify(newData), time, sessionId],
                (error: Error | null) => {
                    if (error) {
                        reject({ error });
                        return;
                    }

                    entry.data = newData;
                    entry.time = time;
                    resolve({ ok: true });
                }
            );
        });
    }

    get(sessionId: string, key: string): unknown {
        const entry = this.sessions.get(sessionId);

        if (!entry) {
            return null;
        }

        return Object.prototype.hasOwnProperty.call(entry.data, key)
            ? entry.data[key]
            : null;
    }

    remove(sessionId: string, items: string[] | null = null): Promise<{ ok: true }> {
        const entry = this.sessions.get(sessionId);

        if (!entry) {
            return Promise.resolve({ ok: true });
        }

        if (items === null) {
            return new Promise((resolve, reject) => {
                sql.handle.query(
                    'delete from nodesession where id = ?',
                    [sessionId],
                    (error: Error | null) => {
                        if (error) {
                            reject({ error });
                            return;
                        }

                        this.sessions.delete(sessionId);
                        resolve({ ok: true });
                    }
                );
            });
        }

        let changed = false;

        items.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(entry.data, key)) {
                delete entry.data[key];
                changed = true;
            }
        });

        if (!changed) {
            return Promise.resolve({ ok: true });
        }

        const time = Date.now();

        return new Promise((resolve, reject) => {
            sql.handle.query(
                'update nodesession set data = ?, time = ? where id = ?',
                [JSON.stringify(entry.data), time, sessionId],
                (error: Error | null) => {
                    if (error) {
                        reject({ error });
                        return;
                    }

                    entry.time = time;
                    resolve({ ok: true });
                }
            );
        });
    }

    expire(sessionId: string): boolean {
        const entry = this.sessions.get(sessionId);

        if (!entry) {
            return true;
        }

        return Date.now() - entry.time > sessionLifeTime;
    }

    update(sessionId: string): Promise<{ ok: true }> {
        const entry = this.sessions.get(sessionId);

        if (!entry) {
            return Promise.reject({ error: new Error('Session not found') });
        }

        const time = Date.now();

        return new Promise((resolve, reject) => {
            sql.handle.query(
                'update nodesession set time = ? where id = ?',
                [time, sessionId],
                (error: Error | null) => {
                    if (error) {
                        reject({ error });
                        return;
                    }

                    entry.time = time;
                    resolve({ ok: true });
                }
            );
        });
    }

    private parseSessionData(rawData: string): Record<string, unknown> {
        try {
            return rawData ? (JSON.parse(rawData) as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    }
}

const sessionStore = new SessionStore();

const exist = (sessionId: string | null = null): boolean => sessionStore.has(sessionId);
const create = (sessionId: string | null = null): Promise<{ sessionId: string }> => sessionStore.create(sessionId);
const set = (sessionId: string, hashObject: Record<string, unknown>): Promise<{ ok: true }> => sessionStore.set(sessionId, hashObject);
const get = (sessionId: string, key: string): unknown => sessionStore.get(sessionId, key);
const remove = (sessionId: string, items: string[] | null = null): Promise<{ ok: true }> => sessionStore.remove(sessionId, items);
const expire = (sessionId: string): boolean => sessionStore.expire(sessionId);
const update = (sessionId: string): Promise<{ ok: true }> => sessionStore.update(sessionId);

exports.exist = exist;
exports.create = create;
exports.set = set;
exports.get = get;
exports.remove = remove;
exports.expire = expire;
exports.update = update;