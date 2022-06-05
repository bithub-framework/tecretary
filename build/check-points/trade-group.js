"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTradeGroupCheckPoints = void 0;
function* makeTradeGroupCheckPoints(groups, adminTex) {
    for (const group of groups) {
        yield {
            cb: () => {
                adminTex.updateTrades(group);
            },
            time: group[0].time,
        };
    }
}
exports.makeTradeGroupCheckPoints = makeTradeGroupCheckPoints;
//# sourceMappingURL=trade-group.js.map