"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPointsFromDatabaseTradeGroups = void 0;
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
//# sourceMappingURL=trade-group.js.map