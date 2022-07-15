"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookReader = void 0;
const secretary_like_1 = require("secretary-like");
class OrderbookReader {
    constructor(db, H) {
        this.db = db;
        this.H = H;
    }
    getDatabaseOrderbooksAfterId(marketName, texchange, afterOrderbookId) {
        const rawBookOrders = this.getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, texchange);
        return databaseOrderbooks;
    }
    getDatabaseOrderbooksAfterTime(marketName, texchange, afterTime) {
        const rawBookOrders = this.getRawBookOrdersAfterTime(marketName, afterTime);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const databaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, texchange);
        return databaseOrderbooks;
    }
    *rawBookOrderGroupsFromRawBookOrders(rawBookOrders) {
        let $group = [];
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
    *databaseOrderbooksFromRawBookOrderGroups(groups, texchange) {
        const facade = texchange.getAdminFacade();
        const marketSpec = facade.getMarketSpec();
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
    getRawBookOrdersAfterTime(marketName, afterTime) {
        return this.db.prepare(`
			SELECT
				markets.name AS marketName,
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
				orderbooks.time >= ?
			ORDER BY time, bid, price
		;`).iterate(marketName, afterTime);
    }
    getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId) {
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
				markets.name AS marketName,
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
				)
			ORDER BY time, bid, price
		;`).iterate(marketName, afterTime, afterOrderbookId, afterTime);
    }
}
exports.OrderbookReader = OrderbookReader;
//# sourceMappingURL=orderbook-reader.js.map