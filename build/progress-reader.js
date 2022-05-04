"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReader = void 0;
const Database = require("better-sqlite3");
const startable_1 = require("startable");
const assert = require("assert");
class ProgressReader {
    constructor(config) {
        this.config = config;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.PROJECTS_DB_FILE_PATH, {
            fileMustExist: true,
        });
        this.lock();
    }
    lock() {
        this.db.transaction(() => {
            const running = this.db.prepare(`
				SELECT name
				FROM running
				WHERE name = ?
			;`).get(this.config.projectName).running;
            assert(typeof running !== 'undefined');
            this.db.prepare(`
				INSERT INTO running
				(name)
				VALUES (?)
			;`).run(this.config.projectName);
        });
    }
    unlock() {
        this.db.prepare(`
			DELETE FROM running
			WHERE name = ?
		;`).run(this.config.projectName);
    }
    getTime() {
        const result = this.db.prepare(`
            SELECT
				time
            FROM projects
            WHERE name = ?
        ;`).get(this.config.projectName);
        if (typeof result !== 'undefined')
            return result.time;
        return this.config.startTime;
    }
    setTime(time) {
        this.db.prepare(`
			INSERT OR REPLACE INTO projects
			(name, time)
			VALUES (?, ?)
		;`).run(this.config.projectName, this.config.startTime);
    }
    getSnapshot(marketName) {
        const result = this.db.prepare(`
            SELECT snapshot
            FROM snapshots
            WHERE project_name = ?
                AND market_name = ?
        ;`).get(this.config.projectName, marketName);
        if (typeof result !== 'undefined')
            return JSON.parse(result.snapshot);
        else
            return null;
    }
    setSnapshot(marketName, snapshot) {
        const json = JSON.stringify(snapshot);
        this.db.prepare(`
			INSERT OR REPLACE INTO snapshots
			(project_name, market_name, snapshot)
			VALUES (?, ?, ?)
        ;`).run(this.config.projectName, marketName, json);
    }
    async start() { }
    async stop() {
        this.unlock();
        this.db.close();
    }
}
exports.ProgressReader = ProgressReader;
//# sourceMappingURL=progress-reader.js.map