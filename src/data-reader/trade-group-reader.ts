import { RawTrade, RawSide } from './raw-data';
import Database = require('better-sqlite3');
import {
	HFactory, HLike,
	MarketSpec,
	Side,
} from 'secretary-like';
import { DatabaseTrade } from 'texchange';
import { DatabaseIterableIterator } from './database-iterable-iterator';



export class TradeGroupReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private hFactory: HFactory<H>,
	) { }

	public getDatabaseTradeGroupsAfterId(
		marketName: string,
		marketSpec: MarketSpec<H>,
		afterTradeId: number,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void> {
		const rawTrades = this.getRawTradesAfterTradeId(
			marketName,
			afterTradeId,
			endTime,
		);

		const databaseTrades = this.databaseTradesFromRawTrades(
			rawTrades,
			marketSpec,
		);

		const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
			databaseTrades,
		);

		return databaseTradeGroups;
	}

	public getDatabaseTradeGroupsAfterTime(
		marketName: string,
		marketSpec: MarketSpec<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void> {
		const rawTrades = this.getRawTradesAfterTime(
			marketName,
			afterTime,
			endTime,
		);

		const databaseTrades = this.databaseTradesFromRawTrades(
			rawTrades,
			marketSpec,
		);

		const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
			databaseTrades,
		);

		return databaseTradeGroups;
	}

	private *databaseTradeGroupsFromDatabaseTrades(
		trades: Generator<DatabaseTrade<H>, void>,
	): Generator<DatabaseTrade<H>[], void> {
		let $group: DatabaseTrade<H>[] = [];
		try {
			for (const trade of trades) {
				if (
					$group.length > 0 &&
					$group[0].time !== trade.time
				) {
					yield $group;
					$group = [];
				}
				$group.push(trade);
			}
			if ($group.length > 0)
				yield $group;
		} finally {
			trades.return();
		}
	}

	private *databaseTradesFromRawTrades(
		rawTrades: DatabaseIterableIterator<RawTrade>,
		marketSpec: MarketSpec<H>,
	): Generator<DatabaseTrade<H>, void> {
		try {
			for (const rawTrade of rawTrades) {
				yield {
					price: this.hFactory.from(rawTrade.price).round(marketSpec.PRICE_DP),
					quantity: this.hFactory.from(rawTrade.quantity).round(marketSpec.QUANTITY_DP),
					side: rawTrade.side === RawSide.BID ? Side.BID : Side.ASK,
					id: `${rawTrade.id}`,
					time: rawTrade.time,
				};
			}
		} finally {
			rawTrades.return();
		}
	}

	private getRawTradesAfterTime(
		marketName: string,
		afterTime: number,
		endTime: number,
	): DatabaseIterableIterator<RawTrade> {
		return <DatabaseIterableIterator<RawTrade>>this.db.prepare(`
			SELECT
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				trades.id AS id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.time >= ? AND
				trades.time <= ?
			ORDER BY time
		;`).iterate(
			marketName,
			afterTime,
			endTime,
		);
	}

	private getRawTradesAfterTradeId(
		marketName: string,
		afterTradeId: number,
		endTime: number,
	): DatabaseIterableIterator<RawTrade> {
		const afterTime: number = this.db.prepare(`
			SELECT time
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.id = ?
		;`).get(
			marketName,
			afterTradeId,
		).time;

		return <Generator<RawTrade, void>>this.db.prepare(`
			SELECT
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				trades.id AS id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				(
					trades.time = ? AND trades.id > ?
					OR trades.time > ?
				) AND
				trades.time <= ?
			ORDER BY time
		;`).iterate(
			marketName,
			afterTime,
			afterTradeId,
			afterTime,
			endTime,
		);
	}
}
