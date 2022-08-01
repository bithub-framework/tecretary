import { RawBookOrder, RawSide } from './raw-data';
import Database = require('better-sqlite3');
import {
	HLike,
	Side,
	BookOrder,
	MarketSpec,
} from 'secretary-like';
import {
	DatabaseOrderbook,
	DataTypesNamespace as TexchangeDataTypesNamespace,
} from 'texchange';
import { DatabaseIterable } from './database-iterable-iterator';



export class OrderbookReader<H extends HLike<H>> {
	public constructor(
		private db: Database.Database,
		private DataTypes: TexchangeDataTypesNamespace<H>,
	) { }

	public getDatabaseOrderbooksAfterId(
		marketName: string,
		marketSpec: MarketSpec<H>,
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
		marketSpec: MarketSpec<H>,
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
		rawBookOrders: DatabaseIterable<RawBookOrder>,
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
		marketSpec: MarketSpec<H>,
	): Generator<DatabaseOrderbook<H>, void> {
		try {
			for (const group of groups) {
				const asks: BookOrder<H>[] = group
					.filter(order => order.side === RawSide.ASK)
					.map(order => this.DataTypes.bookOrderFactory.create({
						price: this.DataTypes.hFactory.from(order.price).round(marketSpec.PRICE_SCALE),
						quantity: this.DataTypes.hFactory.from(order.quantity).round(marketSpec.QUANTITY_SCALE),
						side: Side.ASK,
					}));
				const bids: BookOrder<H>[] = group
					.filter(order => order.side === RawSide.BID)
					.map(order => this.DataTypes.bookOrderFactory.create({
						price: this.DataTypes.hFactory.from(order.price).round(marketSpec.PRICE_SCALE),
						quantity: this.DataTypes.hFactory.from(order.quantity).round(marketSpec.QUANTITY_SCALE),
						side: Side.BID,
					})).reverse();
				yield this.DataTypes.databaseOrderbookFactory.create({
					[Side.BID]: bids,
					[Side.ASK]: asks,
					time: group[0].time,
					id: group[0].id.toString(),
				});
			}
		} finally {
			groups.return();
		}
	}

	private getRawBookOrdersAfterTime(
		marketName: string,
		afterTime: number,
		endTime: number,
	): DatabaseIterable<RawBookOrder> {
		return <DatabaseIterable<RawBookOrder>>this.db.prepare(`
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
	): DatabaseIterable<RawBookOrder> {
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

		return <DatabaseIterable<RawBookOrder>>this.db.prepare(`
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
