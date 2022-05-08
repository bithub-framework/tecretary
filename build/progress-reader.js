"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressReader = void 0;
const Database = require("better-sqlite3");
const startable_1 = require("startable");
const injektor_1 = require("injektor");
const types_1 = require("./injection/types");
const assert = require("assert");
let ProgressReader = class ProgressReader {
    constructor(config) {
        this.config = config;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.PROJECTS_DB_FILE_PATH, {
            fileMustExist: true,
        });
        this.lock();
    }
    capture(time, adminTexMap) {
        this.db.transaction(() => {
            this.setTime(time);
            for (const [name, tex] of adminTexMap) {
                const snapshot = tex.capture();
                this.setSnapshot(name, snapshot);
            }
        });
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
    log(content, time) {
        this.db.prepare(`
			INSERT INTO logs
			(project_name, time, content)
			VALUES (?, ?, ?)
		;`).run(this.config.projectName, time, content);
    }
    async start() { }
    async stop() {
        this.unlock();
        this.db.close();
    }
};
ProgressReader = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.Config))
], ProgressReader);
exports.ProgressReader = ProgressReader;
//# sourceMappingURL=progress-reader.js.map