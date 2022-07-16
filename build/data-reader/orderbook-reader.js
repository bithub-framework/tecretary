"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookReader = void 0;
const secretary_like_1 = require("secretary-like");
class OrderbookReader {
    constructor(db, H) {
        this.db = db;
        this.H = H;
    }
    getDatabaseOrderbooksAfterId(marketName, texchange, afterOrderbookId, endTime) {
        const rawBookOrders = this.getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId, endTime);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, texchange);
        return databaseOrderbooks;
    }
    getDatabaseOrderbooksAfterTime(marketName, texchange, afterTime, endTime) {
        const rawBookOrders = this.getRawBookOrdersAfterTime(marketName, afterTime, endTime);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, texchange);
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
    *databaseOrderbooksFromRawBookOrderGroups(groups, texchange) {
        const facade = texchange.getAdminFacade();
        const marketSpec = facade.getMarketSpec();
        try {
            for (const group of groups) {
                const asks = group
                    .filter(order => order.side === secretary_like_1.Side.ASK)
                    .map(order => ({
                    price: new this.H(order.price).round(marketSpec.PRICE_DP),
                    quantity: new this.H(order.quantity).round(marketSpec.QUANTITY_DP),
                    side: order.side,
                }));
                const bids = group
                    .filter(order => order.side === secretary_like_1.Side.BID)
                    .map(order => ({
                    price: new this.H(order.price).round(marketSpec.PRICE_DP),
                    quantity: new this.H(order.quantity).round(marketSpec.QUANTITY_DP),
                    side: order.side,
                }));
                yield {
                    id: group[0].id.toString(),
                    time: group[0].time,
                    [secretary_like_1.Side.ASK]: asks,
                    [secretary_like_1.Side.BID]: bids,
                };
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