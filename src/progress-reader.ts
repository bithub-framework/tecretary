import Database = require('better-sqlite3');
import { Config } from './config';
import { Snapshot } from 'texchange/build/models';
import { Startable } from 'startable';
import assert = require('assert');



export class ProgressReader {
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
		this.lock();
	}

	private lock(): void {
		this.db.transaction(() => {
			const running = this.db.prepare(`
				SELECT name
				FROM running
				WHERE name = ?
			;`).get(
				this.config.projectName,
			).running;
			assert(typeof running !== 'undefined');
			this.db.prepare(`
				INSERT INTO running
				(name)
				VALUES (?)
			;`).run(
				this.config.projectName,
			);
		});
	}

	private unlock(): void {
		this.db.prepare(`
			DELETE FROM running
			WHERE name = ?
		;`).run(
			this.config.projectName,
		);
	}

	public getTime(): number {
		const result = this.db.prepare(`
            SELECT
				time
            FROM projects
            WHERE name = ?
        ;`).get(
			this.config.projectName,
		);
		if (typeof result !== 'undefined') return result.time;
		return this.config.startTime;
	}

	public setTime(time: number): void {
		this.db.prepare(`
			INSERT OR REPLACE INTO projects
			(name, time)
			VALUES (?, ?)
		;`).run(
			this.config.projectName,
			this.config.startTime,
		);
	}

	public getSnapshot<PricingSnapshot>(
		marketName: string,
	): Snapshot<PricingSnapshot> | null {
		const result = this.db.prepare(`
            SELECT snapshot
            FROM snapshots
            WHERE project_name = ?
                AND market_name = ?
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
			INSERT OR REPLACE INTO snapshots
			(project_name, market_name, snapshot)
			VALUES (?, ?, ?)
        ;`).run(
			this.config.projectName,
			marketName,
			json,
		);
	}

	private async start(): Promise<void> { }

	private async stop(): Promise<void> {
		this.unlock();
		this.db.close();
	}
}
