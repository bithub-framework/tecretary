"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReader = void 0;
const Database = require("better-sqlite3");
const startable_1 = require("startable");
class ProgressReader {
    constructor(config) {
        this.config = config;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.PROJECTS_DB_FILE_PATH, {
            fileMustExist: true,
        });
        this.db.prepare(`
            INSERT OR IGNORE INTO projects
            (name, time)
            VALUES (?, ?)
        ;`).run(config.projectName, config.startTime);
        const result = this.db.prepare(`
            SELECT
				id,
				time
            FROM projects
            WHERE name = ?
        ;`).get(this.config.projectName);
        this.projectId = result.id;
        this.time = result.time;
    }
    getTime() {
        return this.time;
    }
    getSnapshot(marketName) {
        const result = this.db.prepare(`
            SELECT snapshot
            FROM projects, snapshots
            WHERE projects.name = ?
				AND projects.id = snapshots.pid
                AND snapshots.market_name = ?
        ;`).get(this.config.projectName, marketName);
        if (typeof result !== 'undefined')
            return JSON.parse(result.snapshot);
        else
            return null;
    }
    setSnapshot(marketName, snapshot) {
        const json = JSON.stringify(snapshot);
        this.db.prepare(`
			INSERT INTO snapshots
			(pid, market_name, snapshot)
			VALUES (?, ?, ?)
			ON CONFLICT(pid, market_name)
			DO UPDATE SET
				snapshot = ?
        ;`).run(this.projectId, marketName, json, json);
    }
    async start() { }
    async stop() {
        this.db.close();
    }
}
exports.ProgressReader = ProgressReader;
//# sourceMappingURL=progress-reader.js.map