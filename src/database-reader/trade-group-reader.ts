import {
	RawBookOrder,
	RawTrade,
} from '../raw-data';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import assert = require('assert');


export class TradeGroupReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private H: HStatic<H>,
		private adminTexMap: Map<string, AdminTex<H>>,
	) { }

	public getDatabaseTradeGroups(
		marketName: string,
		afterTradeId?: number,
	): IterableIterator<DatabaseTrade<H>[]> {
		const adminTex = this.adminTexMap.get(marketName);
		assert(adminTex);

		const rawTrades = typeof afterTradeId !== 'undefined'
			? this.getRawTradesAfterTradeId(
				marketName,
				afterTradeId,
			) : this.getRawTrades(
				marketName,
			);

		const databaseTrades = this.databaseTradesFromRawTrades(
			rawTrades,
			adminTex,
		);

		const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
			databaseTrades,
		);

		return databaseTradeGroups;
	}

	private *databaseTradeGroupsFromDatabaseTrades(
		trades: IterableIterator<DatabaseTrade<H>>,
	): Generator<DatabaseTrade<H>[], void> {
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
		rawTrades: IterableIterator<RawTrade>,
		adminTex: AdminTex<H>,
	): Generator<DatabaseTrade<H>, void> {
		for (const rawTrade of rawTrades) {
			yield {
				price: new this.H(rawTrade.price).round(adminTex.config.market.PRICE_DP),
				quantity: new this.H(rawTrade.quantity).round(adminTex.config.market.QUANTITY_DP),
				side: rawTrade.side,
				id: rawTrade.id.toString(),
				time: rawTrade.time,
			};
		}
	}

	private getRawTrades(
		marketName: string,
	): IterableIterator<RawTrade> {
		return this.db.prepare(`
            SELECT
                name AS marketName,
                CAST(price AS CHAR) AS price,
                CAST(quantity AS CHAR) AS quantity,
                side,
                time
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
            ORDER BY time
        ;`).iterate(
			marketName,
		);
	}

	private getRawTradesAfterTradeId(
		marketName: string,
		afterTradeId: number,
	): IterableIterator<RawTrade> {
		const afterTime: number = this.db.prepare(`
            SELECT time
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
                AND trades.id = ?
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
                id
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
                AND (
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
