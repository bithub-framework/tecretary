import { RawTrade, RawSide } from './raw-data';
import Database = require('better-sqlite3');
import {
	HFactory, HLike,
	MarketSpecLike,
	Side,
} from 'secretary-like';
import {
	DatabaseTradeLike,
	DataTypesNamespace as TexchangeDataTypesNamespace,
} from 'texchange';
import { DatabaseIterableIterator } from './database-iterable-iterator';



export class TradeGroupReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private DataTypes: TexchangeDataTypesNamespace<H>,
	) { }

	public getDatabaseTradeGroupsAfterId(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
		afterTradeId: number,
		endTime: number,
	): Generator<DatabaseTradeLike<H>[], void> {
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
		marketSpec: MarketSpecLike<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseTradeLike<H>[], void> {
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
		trades: Generator<DatabaseTradeLike<H>, void>,
	): Generator<DatabaseTradeLike<H>[], void> {
		let $group: DatabaseTradeLike<H>[] = [];
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
		marketSpec: MarketSpecLike<H>,
	): Generator<DatabaseTradeLike<H>, void> {
		try {
			for (const rawTrade of rawTrades) {
				yield this.DataTypes.databaseTradeFactory.new({
					price: this.DataTypes.hFactory.from(rawTrade.price).round(marketSpec.PRICE_SCALE),
					quantity: this.DataTypes.hFactory.from(rawTrade.quantity).round(marketSpec.QUANTITY_SCALE),
					side: rawTrade.side === RawSide.BID ? Side.BID : Side.ASK,
					id: rawTrade.id.toString(),
					time: rawTrade.time,
				});
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
