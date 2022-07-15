"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeGroupReader = void 0;
class TradeGroupReader {
    constructor(db, H) {
        this.db = db;
        this.H = H;
    }
    getDatabaseTradeGroupsAfterId(marketName, texchange, afterTradeId) {
        const rawTrades = this.getRawTradesAfterTradeId(marketName, afterTradeId);
        const databaseTrades = this.databaseTradesFromRawTrades(rawTrades, texchange);
        const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(databaseTrades);
        return databaseTradeGroups;
    }
    getDatabaseTradeGroupsAfterTime(marketName, texchange, afterTime) {
        const rawTrades = this.getRawTradesAfterTime(marketName, afterTime);
        const databaseTrades = this.databaseTradesFromRawTrades(rawTrades, texchange);
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
    *databaseTradesFromRawTrades(rawTrades, texchange) {
        const facade = texchange.getAdminFacade();
        const marketSpec = facade.getMarketSpec();
        for (const rawTrade of rawTrades) {
            yield {
                price: new this.H(rawTrade.price).round(marketSpec.PRICE_DP),
                quantity: new this.H(rawTrade.quantity).round(marketSpec.QUANTITY_DP),
                side: rawTrade.side,
                id: `${rawTrade.id}`,
                time: rawTrade.time,
            };
        }
    }
    getRawTradesAfterTime(marketName, afterTime) {
        return this.db.prepare(`
			SELECT
				name AS marketName,
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.time >= ?
			ORDER BY time
		;`).iterate(marketName, afterTime);
    }
    getRawTradesAfterTradeId(marketName, afterTradeId) {
        const afterTime = this.db.prepare(`
			SELECT time
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.id = ?
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
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				(
					trades.time = ? AND trades.id > ?
					OR trades.time > ?
				)
			ORDER BY time
		;`).iterate(marketName, afterTime, afterTradeId, afterTime);
    }
}
exports.TradeGroupReader = TradeGroupReader;
//# sourceMappingURL=trade-group-reader.js.map