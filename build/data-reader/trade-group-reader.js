"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeGroupReader = void 0;
class TradeGroupReader {
    constructor(db, hFactory) {
        this.db = db;
        this.hFactory = hFactory;
    }
    getDatabaseTradeGroupsAfterId(marketName, texchange, afterTradeId, endTime) {
        const rawTrades = this.getRawTradesAfterTradeId(marketName, afterTradeId, endTime);
        const databaseTrades = this.databaseTradesFromRawTrades(rawTrades, texchange);
        const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(databaseTrades);
        return databaseTradeGroups;
    }
    getDatabaseTradeGroupsAfterTime(marketName, texchange, afterTime, endTime) {
        const rawTrades = this.getRawTradesAfterTime(marketName, afterTime, endTime);
        const databaseTrades = this.databaseTradesFromRawTrades(rawTrades, texchange);
        const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(databaseTrades);
        return databaseTradeGroups;
    }
    *databaseTradeGroupsFromDatabaseTrades(trades) {
        let $group = [];
        try {
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
        finally {
            trades.return();
        }
    }
    *databaseTradesFromRawTrades(rawTrades, texchange) {
        const facade = texchange.getAdminFacade();
        const marketSpec = facade.getMarketSpec();
        try {
            for (const rawTrade of rawTrades) {
                yield {
                    price: this.hFactory.from(rawTrade.price).round(marketSpec.PRICE_DP),
                    quantity: this.hFactory.from(rawTrade.quantity).round(marketSpec.QUANTITY_DP),
                    side: rawTrade.side,
                    id: `${rawTrade.id}`,
                    time: rawTrade.time,
                };
            }
        }
        finally {
            rawTrades.return();
        }
    }
    getRawTradesAfterTime(marketName, afterTime, endTime) {
        return this.db.prepare(`
			SELECT
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				trades.id AS id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				trades.time >= ? AND
				trades.time <= ?
			ORDER BY time
		;`).iterate(marketName, afterTime, endTime);
    }
    getRawTradesAfterTradeId(marketName, afterTradeId, endTime) {
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
				CAST(price AS CHAR) AS price,
				CAST(quantity AS CHAR) AS quantity,
				side,
				time,
				trades.id AS id
			FROM trades, markets
			WHERE
				trades.mid = markets.id AND
				markets.name = ? AND
				(
					trades.time = ? AND trades.id > ?
					OR trades.time > ?
				) AND
				trades.time <= ?
			ORDER BY time
		;`).iterate(marketName, afterTime, afterTradeId, afterTime, endTime);
    }
}
exports.TradeGroupReader = TradeGroupReader;
//# sourceMappingURL=trade-group-reader.js.map