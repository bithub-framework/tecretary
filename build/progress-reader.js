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
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./injection/types");
const lock_pid_file_1 = require("@zimtsui/lock-pid-file");
let ProgressReader = class ProgressReader {
    constructor(config, filePath, startTime) {
        this.config = config;
        this.startTime = startTime;
        this.startable = startable_1.Startable.create(() => this.rawStart(), () => this.rawStop());
        this.start = this.startable.start;
        this.stop = this.startable.stop;
        this.assart = this.startable.assart;
        this.starp = this.startable.starp;
        this.getReadyState = this.startable.getReadyState;
        this.skipStart = this.startable.skipStart;
        (0, lock_pid_file_1.lockPidFile)(config.projectName);
        this.db = new Database(filePath, {
            fileMustExist: true,
        });
        if (!config.continue)
            this.clear();
    }
    capture(time, texchangeMap) {
        this.db.transaction(() => {
            this.setTime(time);
            for (const [name, texchange] of texchangeMap) {
                const facade = texchange.getAdminFacade();
                const snapshot = facade.capture();
                this.setSnapshot(name, snapshot);
            }
        });
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
        return this.startTime;
    }
    setTime(time) {
        this.db.prepare(`
			INSERT OR REPLACE INTO projects
			(name, time)
			VALUES (?, ?)
		;`).run(this.config.projectName, time);
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
    clear() {
        this.db.prepare(`
			DELETE FROM projects
			WHERE name = ?
		;`).run(this.config.projectName);
        this.db.prepare(`
			DELETE FROM logs
			WHERE project_name = ?
		;`).run(this.config.projectName);
        this.db.prepare(`
			DELETE FROM snapshots
			WHERE project_name = ?
		;`).run(this.config.projectName);
    }
    async rawStart() { }
    async rawStop() {
        this.db.close();
    }
};
ProgressReader = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.config)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.progressFilePath)),
    __param(2, (0, injektor_1.inject)(types_1.TYPES.startTime))
], ProgressReader);
exports.ProgressReader = ProgressReader;
//# sourceMappingURL=progress-reader.js.map