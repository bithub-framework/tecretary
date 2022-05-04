"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPointsFromDatabaseOrderbooks = void 0;
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
//# sourceMappingURL=orderbook.js.map