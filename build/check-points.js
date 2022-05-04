"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPointsMaker = void 0;
class CheckPointsMaker {
    constructor(dataReader) {
        this.dataReader = dataReader;
    }
    makeOrderbookCheckPoints(marketName, adminTex) {
        return checkPointsFromDatabaseOrderbooks(this.dataReader.getDatabaseOrderbooks(marketName, adminTex), adminTex);
    }
    makeTradeGroupCheckPoints(marketName, adminTex) {
        return checkPointsFromDatabaseTradeGroups(this.dataReader.getDatabaseTradeGroups(marketName, adminTex), adminTex);
    }
}
exports.CheckPointsMaker = CheckPointsMaker;
function* checkPointsFromDatabaseOrderbooks(orderbooks, adminTex) {
    for (const orderbook of orderbooks) {
        yield {
            cb: () => {
                adminTex.updateOrderbook(orderbook);
            },
            time: orderbook.time,
        };
    }
}
function* checkPointsFromDatabaseTradeGroups(groups, adminTex) {
    for (const group of groups) {
        yield {
            cb: () => {
                adminTex.updateTrades(group);
            },
            time: group[0].time,
        };
    }
}
//# sourceMappingURL=check-points.js.map