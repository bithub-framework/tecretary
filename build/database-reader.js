"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const interfaces_1 = require("interfaces");
const assert = require("assert");
class DatabaseReader {
    constructor(filePath, H, adminTexMap) {
        this.H = H;
        this.adminTexMap = adminTexMap;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(filePath, {
            readonly: true,
            fileMustExist: true,
        });
    }
    getDatabaseTradeGroups(marketName, afterTradeId) {
        const adminTex = this.adminTexMap.get(marketName);
        assert(adminTex);
        const rawTrades = typeof afterTradeId !== 'undefined'
            ? this.getRawTradesAfterTradeId(marketName, afterTradeId) : this.getRawTrades(marketName);
        const databaseTrades = this.databaseTradesFromRawTrades(rawTrades, adminTex);
        const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(databaseTrades);
        return databaseTradeGroups;
    }
    *databaseTradeGroupsFromDatabaseTrades(trades) {
        let $group = [];
        for (const trade of trades) {
            if ($group.length > 0 &&
                $group[0].time !== trade.time) {
                yield $group;
                $group = [];
            }
            $group.push(trade);
        }
        if ($group.length > 0)
            yield $group;
    }
    *databaseTradesFromRawTrades(rawTrades, adminTex) {
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
    getRawTrades(marketName) {
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
        ;`).iterate(marketName);
    }
    getRawTradesAfterTradeId(marketName, afterTradeId) {
        const afterTime = this.db.prepare(`
            SELECT time
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
                AND trades.id = ?
        ;`).get(marketName, afterTradeId).time;
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
        ;`).iterate(marketName, afterTime, afterTradeId, afterTime);
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
    async start() {
    }
    async stop() {
        this.db.close();
    }
}
exports.DatabaseReader = DatabaseReader;
//# sourceMappingURL=database-reader.js.map