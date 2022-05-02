import Database = require('better-sqlite3');
import { Config } from './config';
import { Snapshot } from 'texchange/build/models';
import { Startable } from 'startable';



export class ProgressReader {
	private projectId: number;
	private time: number;
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
            (name, time)
            VALUES (?, ?)
        ;`).run(
			config.projectName,
			config.startTime,
		);

		const result: {
			id: number;
			time: number;
		} = this.db.prepare(`
            SELECT
				id,
				time
            FROM projects
            WHERE name = ?
        ;`).get(
			this.config.projectName,
		);
		this.projectId = result.id
		this.time = result.time;
	}

	public getTime(): number {
		return this.time;
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
		this.db.close();
	}
}
