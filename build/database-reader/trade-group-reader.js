"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeGroupReader = void 0;
const assert = require("assert");
class TradeGroupReader {
    constructor(db, H, adminTexMap) {
        this.db = db;
        this.H = H;
        this.adminTexMap = adminTexMap;
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
}
exports.TradeGroupReader = TradeGroupReader;
//# sourceMappingURL=trade-group-reader.js.map