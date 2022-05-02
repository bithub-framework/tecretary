import Database = require('better-sqlite3');
import { Config } from '../config';
import { Snapshot } from 'texchange/build/texchange';
import assert = require('assert');



export class SnapshotReader {
	private projectId: number;

	public constructor(
		private db: Database.Database,
		private config: Config,
	) {
		this.db.prepare(`
            INSERT OR IGNORE INTO projects
            (name)
            VALUES (?)
        ;`).run(
			config.projectName,
		);

		this.projectId = this.db.prepare(`
            SELECT id
            FROM projects
            WHERE name = ?
        ;`).get(
			this.config.projectName,
		).id;
	}

	public getSnapshot<PricingSnapshot>(
		marketName: string,
	): Snapshot<PricingSnapshot> | null {
		const result = this.db.prepare(`
            SELECT snapshot
            FROM projects, snapshots
            WHERE projects.name = ?
				AND projects.id = snapshots.pid
                AND snapshots.market_name = ?
        ;`).get(
			this.config.projectName,
			marketName,
		);
		if (typeof result !== 'undefined')
			return JSON.parse(result.snapshot);
		else
			return null;
	}

	public setSnapshot<PricingSnapshot>(
		marketName: string,
		snapshot: Snapshot<PricingSnapshot>
	): void {
		const result = this.db.prepare(`
			INSERT INTO snapshots
			(pid, market_name, snapshot)
			VALUES (?, ?, ?)
			ON CONFLICT(pid, market_name)
			DO UPDATE SET
				snapshot = ?
        ;`).run(
			this.config.projectName,
			marketName,
			snapshot,
			snapshot,
		);
	}
}
