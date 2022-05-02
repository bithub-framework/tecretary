import { RawBookOrder } from '../raw-data';
import Database = require('better-sqlite3');
import {
	HStatic, HLike,
	Side,
	BookOrder,
} from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { AdminTex } from 'texchange/build/texchange';
import assert = require('assert');


export class OrderbookReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private adminTexMap: Map<string, AdminTex<H, unknown>>,
		private H: HStatic<H>,
	) { }

	public getDatabaseOrderbooks(
		marketName: string,
		afterOrderbookId?: number,
	): IterableIterator<DatabaseOrderbook<H>> {
		const adminTex = this.adminTexMap.get(marketName);
		assert(adminTex);

		const rawBookOrders = typeof afterOrderbookId !== 'undefined'
			? this.getRawBookOrdersAfterOrderbookId(
				marketName,
				afterOrderbookId,
			) : this.getRawBookOrders(
				marketName,
			);

		const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(
			rawBookOrders,
		);

		const datavaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(
			rawBookOrderGroups,
			adminTex,
		);

		return datavaseOrderbooks;
	}

	private *rawBookOrderGroupsFromRawBookOrders(
		rawBookOrders: IterableIterator<RawBookOrder>,
	): Generator<RawBookOrder[], void> {
		let $group: RawBookOrder[] = [];
		for (const rawBookOrder of rawBookOrders) {
			if ($group.length > 0 && rawBookOrder.id !== $group[0].id) {
				yield $group;
				$group = [];
			}
			$group.push(rawBookOrder);
		}
		if ($group.length > 0)
			yield $group;
	}

	private *databaseOrderbooksFromRawBookOrderGroups(
		groups: IterableIterator<RawBookOrder[]>,
		adminTex: AdminTex<H, unknown>,
	): Generator<DatabaseOrderbook<H>, void> {
		for (const group of groups) {
			const asks: BookOrder<H>[] = group
				.filter(order => order.side === Side.ASK)
				.map(order => ({
					price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
					quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
					side: order.side,
				}));
			const bids = group
				.filter(order => order.side === Side.BID)
				.map(order => ({
					price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
					quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
					side: order.side,
				}));
			yield {
				id: group[0].id.toString(),
				time: group[0].time,
				[Side.ASK]: asks,
				[Side.BID]: bids,
			}
		}
	}

	private getRawBookOrders(
		marketName: string,
	): IterableIterator<RawBookOrder> {
		return this.db.prepare(`
            SELECT
                markets.name AS marketName
                time,
                CAST(price AS TEXT),
                CAST(quantity AS TEXT),
                side,
                bid AS id
            FROM markets, orderbooks, book_orders
            WHERE markets.id = orderbooks.mid
                AND orderbooks.id = book_orders.bid
                AND markets.name = ?
            ORDER BY time, bid, price
        ;`).iterate(
			marketName,
		);
	}

	private getRawBookOrdersAfterOrderbookId(
		marketName: string,
		afterOrderbookId: number,
	): IterableIterator<RawBookOrder> {
		const afterTime: number = this.db.prepare(`
            SELECT time
            FROM orderbooks, markets
            WHERE orderbooks.mid = markets.id
                AND markets.name = ?
                AND orderbooks.id = ?
        ;`).get(
			marketName,
			afterOrderbookId,
		).time;

		return this.db.prepare(`
            SELECT
                markets.name AS marketName
                time,
                CAST(price AS TEXT),
                CAST(quantity AS TEXT),
                side,
                bid AS id
            FROM markets, orderbooks, book_orders
            WHERE markets.id = orderbooks.mid
                AND orderbooks.id = book_orders.bid
                AND markets.name = ?
                AND (
                    orderbooks.time = ? AND orderbooks.id > ?
                    OR orderbooks.time > ?
                )
            ORDER BY time, bid, price
        ;`).iterate(
			marketName,
			afterOrderbookId,
			afterOrderbookId,
			afterTime,
		);
	}
}
