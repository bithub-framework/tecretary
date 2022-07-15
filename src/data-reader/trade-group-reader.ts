import { RawTrade } from './raw-data';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { Texchange } from 'texchange/build/texchange';



export class TradeGroupReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private H: HStatic<H>,
	) { }

	public getDatabaseTradeGroupsAfterId(
		marketName: string,
		texchange: Texchange<H>,
		afterTradeId: number,
	): Iterable<DatabaseTrade<H>[]> {
		const rawTrades = this.getRawTradesAfterTradeId(
			marketName,
			afterTradeId,
		);

		const databaseTrades = this.databaseTradesFromRawTrades(
			rawTrades,
			texchange,
		);

		const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
			databaseTrades,
		);

		return databaseTradeGroups;
	}

	public getDatabaseTradeGroupsAfterTime(
		marketName: string,
		texchange: Texchange<H>,
		afterTime: number,
	): Iterable<DatabaseTrade<H>[]> {
		const rawTrades = this.getRawTradesAfterTime(
			marketName,
			afterTime,
		);

		const databaseTrades = this.databaseTradesFromRawTrades(
			rawTrades,
			texchange,
		);

		const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
			databaseTrades,
		);

		return databaseTradeGroups;
	}

	private *databaseTradeGroupsFromDatabaseTrades(
		trades: Iterable<DatabaseTrade<H>>,
	): Iterable<DatabaseTrade<H>[]> {
		let $group: DatabaseTrade<H>[] = [];
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
	}

	private *databaseTradesFromRawTrades(
		rawTrades: Iterable<RawTrade>,
		texchange: Texchange<H>,
	): Iterable<DatabaseTrade<H>> {
		const facade = texchange.getAdminFacade();
		const marketSpec = facade.getMarketSpec();
		for (const rawTrade of rawTrades) {
			yield {
				price: new this.H(rawTrade.price).round(marketSpec.PRICE_DP),
				quantity: new this.H(rawTrade.quantity).round(marketSpec.QUANTITY_DP),
				side: rawTrade.side,
				id: `${rawTrade.id}`,
				time: rawTrade.time,
			};
		}
	}

	private getRawTradesAfterTime(
		marketName: string,
		afterTime: number,
	): Iterable<RawTrade> {
		return this.db.prepare(`
			SELECT
				name AS marketName,
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				trades.id AS id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.time >= ?
			ORDER BY time
		;`).iterate(
			marketName,
			afterTime,
		);
	}

	private getRawTradesAfterTradeId(
		marketName: string,
		afterTradeId: number,
	): Iterable<RawTrade> {
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

		return this.db.prepare(`
			SELECT
				markets.name AS marketName,
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
				)
			ORDER BY time
		;`).iterate(
			marketName,
			afterTime,
			afterTradeId,
			afterTime,
		);
	}
}
