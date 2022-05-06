import Database = require('better-sqlite3');
import { Config } from './config';
import { Models } from 'texchange/build/models';
import { Startable } from 'startable';
import { AdminTex } from 'texchange/build/texchange';
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

	public capture(
		time: number,
		adminTexMap: Map<string, AdminTex<any>>,
	): void {
		this.db.transaction(() => {
			this.setTime(time);
			for (const [name, tex] of adminTexMap) {
				const snapshot = tex.capture();
				this.setSnapshot(name, snapshot);
			}
		});
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

	private setTime(time: number): void {
		this.db.prepare(`
			INSERT OR REPLACE INTO projects
			(name, time)
			VALUES (?, ?)
		;`).run(
			this.config.projectName,
			this.config.startTime,
		);
	}

	public getSnapshot(
		marketName: string,
	): Models.Snapshot | null {
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

	private setSnapshot(
		marketName: string,
		snapshot: Models.Snapshot,
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
