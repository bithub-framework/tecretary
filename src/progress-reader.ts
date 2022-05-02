import Database = require('better-sqlite3');
import { Config } from './config';
import { Snapshot } from 'texchange/build/models';
import { Startable } from 'startable';
import assert = require('assert');



export class ProgressReader {
	private projectId: number;
	private db: Database.Database;
	public startable = new Startable(
		() => this.start(),
		() => this.stop(),
	);

	public constructor(
		private config: Config,
	) {
		this.db = new Database(
			config.PROJECTS_DB_FILE_PATH,
			{
				fileMustExist: true,
			},
		);

		this.db.prepare(`
			INSERT OR IGNORE INTO projects
			(name, time, running)
			VALUES (?, ?, 0)
		;`).run(
			config.projectName,
			config.startTime,
		);
		this.projectId = this.db.prepare(`
			SELECT id
			FROM projects
			WHERE name = ?
		;`).get(
			this.config.projectName,
		).id;

		this.db.transaction(() => this.lock());
	}

	private lock(): void {
		const running: number = this.db.prepare(`
			SELECT running
			FROM projects
			WHERE id = ?
		;`).get(
			this.projectId,
		).running;
		assert(running === 0);
		this.db.prepare(`
			UPDATE projects
			SET running = 1
			WHERE id = ?
		;`).run(
			this.projectId,
		);
	}

	private unlock(): void {
		this.db.prepare(`
			UPDATE projects
			SET running = 0
			WHERE id = ?
		;`).run(
			this.projectId,
		);
	}

	public getTime(): number {
		return this.db.prepare(`
            SELECT
				id,
				time
            FROM projects
            WHERE name = ?
        ;`).get(
			this.config.projectName,
		).time;
	}

	public setTime(time: number): void {
		this.db.prepare(`
            UPDATE projects
			SET time = ?
			WHERE id = ?
        ;`).run(
			time,
			this.projectId,
		);
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
		const json = JSON.stringify(snapshot);
		this.db.prepare(`
			INSERT INTO snapshots
			(pid, market_name, snapshot)
			VALUES (?, ?, ?)
			ON CONFLICT(pid, market_name)
			DO UPDATE SET
				snapshot = ?
        ;`).run(
			this.projectId,
			marketName,
			json,
			json,
		);
	}

	private async start(): Promise<void> { }

	private async stop(): Promise<void> {
		this.unlock();
		this.db.close();
	}
}
