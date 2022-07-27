"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookReader = void 0;
const secretary_like_1 = require("secretary-like");
const database_orderbook_1 = require("texchange/build/interfaces/database-orderbook");
class OrderbookReader {
    constructor(db, hFactory) {
        this.db = db;
        this.hFactory = hFactory;
    }
    getDatabaseOrderbooksAfterId(marketName, marketSpec, afterOrderbookId, endTime) {
        const rawBookOrders = this.getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId, endTime);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, marketSpec);
        return databaseOrderbooks;
    }
    getDatabaseOrderbooksAfterTime(marketName, marketSpec, afterTime, endTime) {
        const rawBookOrders = this.getRawBookOrdersAfterTime(marketName, afterTime, endTime);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, marketSpec);
        return databaseOrderbooks;
    }
    *rawBookOrderGroupsFromRawBookOrders(rawBookOrders) {
        let $group = [];
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
        }
        finally {
            rawBookOrders.return();
        }
    }
    *databaseOrderbooksFromRawBookOrderGroups(groups, marketSpec) {
        try {
            for (const group of groups) {
                const asks = group
                    .filter(order => order.side === secretary_like_1.Side.ASK)
                    .map(order => ({
                    price: this.hFactory.from(order.price).round(marketSpec.PRICE_DP),
                    quantity: this.hFactory.from(order.quantity).round(marketSpec.QUANTITY_DP),
                    side: order.side,
                }));
                const bids = group
                    .filter(order => order.side === secretary_like_1.Side.BID)
                    .map(order => ({
                    price: this.hFactory.from(order.price).round(marketSpec.PRICE_DP),
                    quantity: this.hFactory.from(order.quantity).round(marketSpec.QUANTITY_DP),
                    side: order.side,
                }));
                yield new database_orderbook_1.DatabaseOrderbook(bids, asks, group[0].time, group[0].id.toString());
            }
        }
        finally {
            groups.return();
        }
    }
    getRawBookOrdersAfterTime(marketName, afterTime, endTime) {
        return this.db.prepare(`
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
		;`).iterate(marketName, afterTime, endTime);
    }
    getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId, endTime) {
        const afterTime = this.db.prepare(`
			SELECT time
			FROM orderbooks, markets
			WHERE
				orderbooks.mid = markets.id AND
				markets.name = ? AND
				orderbooks.id = ?
		;`).get(marketName, afterOrderbookId).time;
        return this.db.prepare(`
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
		;`).iterate(marketName, afterTime, afterOrderbookId, afterTime, endTime);
    }
}
exports.OrderbookReader = OrderbookReader;
//# sourceMappingURL=orderbook-reader.js.map