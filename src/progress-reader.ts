import Database = require('better-sqlite3');
import { Config } from './config';
import { Models } from 'texchange/build/texchange/models';
import { Startable } from 'startable';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import assert = require('assert');



export class ProgressReader {
	private db: Database.Database;
	public startable = Startable.create(
		() => this.start(),
		() => this.stop(),
	);

	public constructor(
		@inject(TYPES.Config)
		private config: Config,
		@inject(TYPES.progressFilePath)
		filePath: string,
		@inject(TYPES.startTime)
		private startTime: number,
	) {
		this.db = new Database(
			filePath,
			{
				fileMustExist: true,
			},
		);
		this.lock();
	}

	public capture(
		time: number,
		adminTexMap: Map<string, AdminFacade<any>>,
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
		return this.startTime;
	}

	private setTime(time: number): void {
		this.db.prepare(`
			INSERT OR REPLACE INTO projects
			(name, time)
			VALUES (?, ?)
		;`).run(
			this.config.projectName,
			time,
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

	public log(
		content: string,
		time: number,
	): void {
		this.db.prepare(`
			INSERT INTO logs
			(project_name, time, content)
			VALUES (?, ?, ?)
		;`).run(
			this.config.projectName,
			time,
			content,
		);
	}

	private async start(): Promise<void> { }

	private async stop(): Promise<void> {
		this.unlock();
		this.db.close();
	}
}
