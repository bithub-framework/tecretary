import Database = require('better-sqlite3');
import { Config } from './config';
import { Snapshot } from 'texchange';
import { createStartable } from 'startable';
import { Texchange } from 'texchange';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import { HLike } from 'secretary-like';
import { lockPidFile } from '@zimtsui/lock-pid-file';
import { ProgressReaderLike } from './progress-reader-like';



export class ProgressReader<H extends HLike<H>> implements ProgressReaderLike<H> {
	private db: Database.Database;
	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	public constructor(
		@inject(TYPES.config)
		private config: Config,
		@inject(TYPES.progressFilePath)
		filePath: string,
		@inject(TYPES.startTime)
		private startTime: number,
	) {
		lockPidFile(config.projectName);
		this.db = new Database(
			filePath,
			{
				fileMustExist: true,
			},
		);
		if (!config.continue) this.clear();
	}

	public capture(
		time: number,
		texchangeMap: Map<string, Texchange<H>>,
	): void {
		this.db.transaction(() => {
			this.setTime(time);
			for (const [name, texchange] of texchangeMap) {
				const facade = texchange.getAdminFacade();
				const snapshot = facade.capture();
				this.setSnapshot(name, snapshot);
			}
		})();
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
	): Snapshot | null {
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
		snapshot: Snapshot,
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

	private clear(): void {
		this.db.prepare(`
			DELETE FROM logs
			WHERE project_name = ?
		;`).run(this.config.projectName);
		this.db.prepare(`
			DELETE FROM snapshots
			WHERE project_name = ?
		;`).run(this.config.projectName);
		this.db.prepare(`
			DELETE FROM projects
			WHERE name = ?
		;`).run(this.config.projectName);
	}

	private async rawStart(): Promise<void> { }

	private async rawStop(): Promise<void> {
		this.db.close();
	}
}
