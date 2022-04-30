"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPointsFromDatabaseTradeGroups = exports.checkPointsFromDatabaseOrderbooks = void 0;
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
exports.checkPointsFromDatabaseOrderbooks = checkPointsFromDatabaseOrderbooks;
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
exports.checkPointsFromDatabaseTradeGroups = checkPointsFromDatabaseTradeGroups;
//# sourceMappingURL=check-points.js.map