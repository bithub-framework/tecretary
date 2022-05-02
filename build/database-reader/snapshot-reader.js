"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotReader = void 0;
class SnapshotReader {
    constructor(db, config) {
        this.db = db;
        this.config = config;
        this.db.prepare(`
            INSERT OR IGNORE INTO projects
            (name)
            VALUES (?)
        ;`).run(config.projectName);
        this.projectId = this.db.prepare(`
            SELECT id
            FROM projects
            WHERE name = ?
        ;`).get(this.config.projectName).id;
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
        const result = this.db.prepare(`
			INSERT INTO snapshots
			(pid, market_name, snapshot)
			VALUES (?, ?, ?)
			ON CONFLICT(pid, market_name)
			DO UPDATE SET
				snapshot = ?
        ;`).run(this.config.projectName, marketName, snapshot, snapshot);
    }
}
exports.SnapshotReader = SnapshotReader;
//# sourceMappingURL=snapshot-reader.js.map