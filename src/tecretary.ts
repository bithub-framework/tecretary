import {
	createStartable,
	StartableLike,
} from 'startable';
import { DataReaderLike } from './data-reader-like';
import { ProgressReaderLike } from './progress-reader-like';
import { Texchange } from 'texchange';
import { Config } from './config';
import {
	HLike, HFactory,
	StrategyLike,
} from 'secretary-like';
import { makePeriodicCheckPoints } from './check-points/periodic';
import { makeOrderbookCheckPoints } from './check-points/orderbook';
import { makeTradeGroupCheckPoints } from './check-points/trade-group';
import { Timeline } from './timeline/timeline';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import { Shifterator } from 'shiftable';
import { CheckPoint } from './timeline/time-engine';
import { DatabaseTrade } from 'texchange';
import { DatabaseOrderbook } from 'texchange';
import { Rwlock } from '@zimtsui/coroutine-locks';



export class Tecretary<H extends HLike<H>> {
	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	private realMachine = createStartable(
		() => this.realMachineRawStart(),
		() => this.realMachineRawStop(),
	);
	private virtualMachine = createStartable(
		() => this.virtualMachineRawStart(),
		() => this.virtualMachineRawStop(),
	);
	private realMachineRunning?: Rwlock;
	private strategyRunning?: Rwlock;

	private tradeGroupsMap = new Map<string, Generator<DatabaseTrade<H>[], void>>();
	private orderbooksMap = new Map<string, Generator<DatabaseOrderbook<H>, void>>();


	public constructor(
		@inject(TYPES.config)
		private config: Config,
		@inject(TYPES.progressReader)
		private progressReader: ProgressReaderLike<H>,
		@inject(TYPES.timeline)
		private timeline: Timeline,
		@inject(TYPES.texchangeMap)
		private texchangeMap: Map<string, Texchange<H>>,
		@inject(TYPES.strategy)
		private strategy: StrategyLike,
		@inject(TYPES.hFactory)
		private hFactory: HFactory<H>,
		@inject(TYPES.dataReader)
		private dataReader: DataReaderLike<H>,
		@inject(TYPES.endTime)
		endTime: number,
	) {
		for (const [name, texchange] of this.texchangeMap) {
			const facade = texchange.getAdminFacade();
			const marketSpec = facade.getMarketSpec();

			const snapshot = this.progressReader.getSnapshot(name);
			if (snapshot !== null) facade.restore(snapshot);

			const bookId = facade.getLatestDatabaseOrderbookId();
			const orderbooks = bookId !== null
				? this.dataReader.getDatabaseOrderbooksAfterId(
					name, marketSpec,
					bookId, endTime,
				) : this.dataReader.getDatabaseOrderbooksAfterTime(
					name, marketSpec,
					this.progressReader.getTime(), endTime,
				);
			this.orderbooksMap.set(name, orderbooks);
			this.timeline.merge(
				Shifterator.fromIterable(
					makeOrderbookCheckPoints<H>(
						orderbooks,
						texchange,
					),
				),
			);

			const tradeId = facade.getLatestDatabaseTradeId();
			const tradeGroups = tradeId !== null
				? this.dataReader.getDatabaseTradeGroupsAfterId(
					name, marketSpec,
					tradeId, endTime,
				) : this.dataReader.getDatabaseTradeGroupsAfterTime(
					name, marketSpec,
					this.progressReader.getTime(), endTime,
				);
			this.tradeGroupsMap.set(name, tradeGroups);
			this.timeline.merge(
				Shifterator.fromIterable(
					makeTradeGroupCheckPoints<H>(
						tradeGroups,
						texchange,
					),
				),
			);
		}

		this.timeline.merge(
			Shifterator.fromIterable<CheckPoint>([{
				time: endTime,
				cb: this.$s.starp,
			}]),
		);

		// this.timeline.affiliate(
		//	 Shifterator.fromIterable(
		//		 makePeriodicCheckPoints(
		//			 this.timeline.now(),
		//			 this.config.snapshotPeriod,
		//			 () => this.capture(),
		//		 ),
		//	 ),
		// );
	}

	private capture(): void {
		this.progressReader.capture(
			this.timeline.now(),
			this.texchangeMap,
		);
	}

	private async realMachineRawStart() {
		await this.progressReader.$s.start([], this.realMachine.starp);
		await this.dataReader.$s.start([], this.realMachine.starp);
		await this.timeline.$s.start([], this.realMachine.starp);
	}

	private async realMachineRawStop() {
		await this.timeline.$s.stop();
		this.capture();
		for (const tradeGroups of this.tradeGroupsMap.values())
			tradeGroups.return();
		for (const orderbooks of this.orderbooksMap.values())
			orderbooks.return();
		await this.dataReader.$s.stop();
		await this.progressReader.$s.stop();
	}

	private async virtualMachineRawStart() {
		for (const [name, texchange] of this.texchangeMap) {
			const facade = texchange.getAdminFacade();
			await facade.$s.start([], this.virtualMachine.starp);
		}
		this.strategyRunning = new Rwlock();
		this.strategyRunning.trywrlock();
		await this.strategy.$s.start([], err => {
			if (err) this.strategyRunning!.throw(err);
			else this.strategyRunning!.unlock();
			this.virtualMachine.starp(err);
		});
	}

	private async virtualMachineRawStop() {
		for (const [name, texchange] of this.texchangeMap) {
			const facade = texchange.getAdminFacade();
			await facade.$s.stop();
		}
		if (this.strategyRunning) {
			await this.strategyRunning.rdlock().catch(() => { });
			await this.strategy.$s.stop();
		}
	}

	private async rawStart() {
		this.realMachineRunning = new Rwlock();
		this.realMachineRunning.trywrlock();
		await this.realMachine.start([], err => {
			if (err) this.realMachineRunning!.throw(err);
			else this.realMachineRunning!.unlock();
			this.$s.starp(err);
		});
		await Promise.any([
			this.realMachineRunning.rdlock(),
			this.virtualMachine.start([], this.$s.starp),
		]);
	}

	private async rawStop(err?: Error) {
		try {
			if (this.realMachineRunning)
				await Promise.any([
					this.realMachineRunning.rdlock(),
					this.virtualMachine.stop(err),
				]);
		} finally {
			await this.virtualMachine.stop();
		}
	}
}
