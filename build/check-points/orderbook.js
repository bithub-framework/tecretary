"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOrderbookCheckPoints = void 0;
function* makeOrderbookCheckPoints(orderbooks, texchange) {
    const facade = texchange.getAdminFacade();
    for (const orderbook of orderbooks) {
        yield {
            cb: () => {
                facade.updateOrderbook(orderbook);
            },
            time: orderbook.time,
        };
    }
}
exports.makeOrderbookCheckPoints = makeOrderbookCheckPoints;
//# sourceMappingURL=orderbook.js.map