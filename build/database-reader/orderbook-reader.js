"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookReader = void 0;
const interfaces_1 = require("interfaces");
const assert = require("assert");
class OrderbookReader {
    constructor(db, H, adminTexMap) {
        this.db = db;
        this.H = H;
        this.adminTexMap = adminTexMap;
    }
    getDatabaseOrderbooks(marketName, afterOrderbookId) {
        const adminTex = this.adminTexMap.get(marketName);
        assert(adminTex);
        const rawBookOrders = typeof afterOrderbookId !== 'undefined'
            ? this.getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId) : this.getRawBookOrders(marketName);
        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(rawBookOrders);
        const datavaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(rawBookOrderGroups, adminTex);
        return datavaseOrderbooks;
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
    *databaseOrderbooksFromRawBookOrderGroups(groups, adminTex) {
        for (const group of groups) {
            const asks = group
                .filter(order => order.side === interfaces_1.Side.ASK)
                .map(order => ({
                price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
                quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
                side: order.side,
            }));
            const bids = group
                .filter(order => order.side === interfaces_1.Side.BID)
                .map(order => ({
                price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
                quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
                side: order.side,
            }));
            yield {
                id: group[0].id.toString(),
                time: group[0].time,
                [interfaces_1.Side.ASK]: asks,
                [interfaces_1.Side.BID]: bids,
            };
        }
    }
    getRawBookOrders(marketName) {
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
        ;`).iterate(marketName);
    }
    getRawBookOrdersAfterOrderbookId(marketName, afterOrderbookId) {
        const afterTime = this.db.prepare(`
            SELECT time
            FROM orderbooks, markets
            WHERE orderbooks.mid = markets.id
                AND markets.name = ?
                AND orderbooks.id = ?
        ;`).get(marketName, afterOrderbookId).time;
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
        ;`).iterate(marketName, afterOrderbookId, afterOrderbookId, afterTime);
    }
}
exports.OrderbookReader = OrderbookReader;
//# sourceMappingURL=orderbook-reader.js.map