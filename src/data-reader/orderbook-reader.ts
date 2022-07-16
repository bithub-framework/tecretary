import { RawBookOrder } from './raw-data';
import Database = require('better-sqlite3');
import {
	HStatic, HLike,
	Side,
	BookOrder,
} from 'secretary-like';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { Texchange } from 'texchange/build/texchange';



export class OrderbookReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private H: HStatic<H>,
	) { }

	public getDatabaseOrderbooksAfterId(
		marketName: string,
		texchange: Texchange<H>,
		afterOrderbookId: number,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void> {
		const rawBookOrders = this.getRawBookOrdersAfterOrderbookId(
			marketName,
			afterOrderbookId,
			endTime,
		);

		const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(
			rawBookOrders,
		);

		const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(
			rawBookOrderGroups,
			texchange,
		);

		return databaseOrderbooks;
	}

	public getDatabaseOrderbooksAfterTime(
		marketName: string,
		texchange: Texchange<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void> {
		const rawBookOrders = this.getRawBookOrdersAfterTime(
			marketName,
			afterTime,
			endTime,
		);

		const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(
			rawBookOrders,
		);

		const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(
			rawBookOrderGroups,
			texchange,
		);

		return databaseOrderbooks;
	}

	private *rawBookOrderGroupsFromRawBookOrders(
		rawBookOrders: Generator<RawBookOrder, void>,
	): Generator<RawBookOrder[], void> {
		let $group: RawBookOrder[] = [];
		try {
			for (const rawBookOrder of rawBookOrders) {
				if ($group.length > 0 && rawBookOrder.id !== $group[0].id) {
					yield $group;
					$group = [];
				}
				$group.push(rawBookOrder);
			}
			if ($group.length > 0)
				yield $group;
		} finally {
			rawBookOrders.return();
		}
	}

	private *databaseOrderbooksFromRawBookOrderGroups(
		groups: Generator<RawBookOrder[], void>,
		texchange: Texchange<H>,
	): Generator<DatabaseOrderbook<H>, void> {
		const facade = texchange.getAdminFacade();
		const marketSpec = facade.getMarketSpec();
		try {
			for (const group of groups) {
				const asks: BookOrder<H>[] = group
					.filter(order => order.side === Side.ASK)
					.map(order => ({
						price: new this.H(order.price).round(marketSpec.PRICE_DP),
						quantity: new this.H(order.quantity).round(marketSpec.QUANTITY_DP),
						side: order.side,
					}));
				const bids = group
					.filter(order => order.side === Side.BID)
					.map(order => ({
						price: new this.H(order.price).round(marketSpec.PRICE_DP),
						quantity: new this.H(order.quantity).round(marketSpec.QUANTITY_DP),
						side: order.side,
					}));
				yield {
					id: group[0].id.toString(),
					time: group[0].time,
					[Side.ASK]: asks,
					[Side.BID]: bids,
				}
			}
		} finally {
			groups.return();
		}
	}

	private getRawBookOrdersAfterTime(
		marketName: string,
		afterTime: number,
		endTime: number,
	): Generator<RawBookOrder, void> {
		return <Generator<RawBookOrder, void>>this.db.prepare(`
			SELECT
				time,
				CAST(price AS TEXT) AS price,
				CAST(quantity AS TEXT) AS quantity,
				side,
				bid AS id
			FROM markets, orderbooks, book_orders
			WHERE
				markets.id = orderbooks.mid AND
				orderbooks.id = book_orders.bid AND
				markets.name = ? AND
				orderbooks.time >= ? AND
				orderbooks.time <= ?
			ORDER BY time, bid, price
		;`).iterate(
			marketName,
			afterTime,
			endTime,
		);
	}

	private getRawBookOrdersAfterOrderbookId(
		marketName: string,
		afterOrderbookId: number,
		endTime: number,
	): Generator<RawBookOrder, void> {
		const afterTime: number = this.db.prepare(`
			SELECT time
			FROM orderbooks, markets
			WHERE
				orderbooks.mid = markets.id AND
				markets.name = ? AND
				orderbooks.id = ?
		;`).get(
			marketName,
			afterOrderbookId,
		).time;

		return <Generator<RawBookOrder, void>>this.db.prepare(`
			SELECT
				time,
				CAST(price AS TEXT) AS price,
				CAST(quantity AS TEXT) AS quantity,
				side,
				bid AS id
			FROM markets, orderbooks, book_orders
			WHERE
				markets.id = orderbooks.mid AND
				orderbooks.id = book_orders.bid AND
				markets.name = ? AND
				(
					orderbooks.time = ? AND orderbooks.id > ?
					OR orderbooks.time > ?
				) AND
				orderbooks.time <= ?
			ORDER BY time, bid, price
		;`).iterate(
			marketName,
			afterTime,
			afterOrderbookId,
			afterTime,
			endTime,
		);
	}
}
