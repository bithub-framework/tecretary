import { RawBookOrder, RawSide } from './raw-data';
import Database = require('better-sqlite3');
import {
	HFactory, HLike,
	Side,
	BookOrder,
	MarketSpecLike,
} from 'secretary-like';
import { DatabaseOrderbook } from 'texchange';
import { DatabaseIterableIterator } from './database-iterable-iterator';



export class OrderbookReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private hFactory: HFactory<H>,
	) { }

	public getDatabaseOrderbooksAfterId(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
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
			marketSpec,
		);

		return databaseOrderbooks;
	}

	public getDatabaseOrderbooksAfterTime(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
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
			marketSpec,
		);

		return databaseOrderbooks;
	}

	private *rawBookOrderGroupsFromRawBookOrders(
		rawBookOrders: DatabaseIterableIterator<RawBookOrder>,
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
		marketSpec: MarketSpecLike<H>,
	): Generator<DatabaseOrderbook<H>, void> {
		try {
			for (const group of groups) {
				const asks: BookOrder<H>[] = group
					.filter(order => order.side === RawSide.ASK)
					.map(order => ({
						price: this.hFactory.from(order.price).round(marketSpec.PRICE_SCALE),
						quantity: this.hFactory.from(order.quantity).round(marketSpec.QUANTITY_SCALE),
						side: Side.ASK,
					}));
				const bids: BookOrder<H>[] = group
					.filter(order => order.side === RawSide.BID)
					.map(order => ({
						price: this.hFactory.from(order.price).round(marketSpec.PRICE_SCALE),
						quantity: this.hFactory.from(order.quantity).round(marketSpec.QUANTITY_SCALE),
						side: Side.BID,
					})).reverse();
				yield {
					[Side.BID]: bids,
					[Side.ASK]: asks,
					time: group[0].time,
					id: group[0].id.toString(),
				};
			}
		} finally {
			groups.return();
		}
	}

	private getRawBookOrdersAfterTime(
		marketName: string,
		afterTime: number,
		endTime: number,
	): DatabaseIterableIterator<RawBookOrder> {
		return <DatabaseIterableIterator<RawBookOrder>>this.db.prepare(`
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
	): DatabaseIterableIterator<RawBookOrder> {
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

		return <DatabaseIterableIterator<RawBookOrder>>this.db.prepare(`
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
