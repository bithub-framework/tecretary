"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTradeGroupCheckPoints = void 0;
function* makeTradeGroupCheckPoints(groups, texchange) {
    const facade = texchange.getAdminFacade();
    for (const group of groups) {
        yield {
            cb: () => {
                facade.updateTrades(group);
            },
            time: group[0].time,
        };
    }
}
exports.makeTradeGroupCheckPoints = makeTradeGroupCheckPoints;
//# sourceMappingURL=trade-group.js.map