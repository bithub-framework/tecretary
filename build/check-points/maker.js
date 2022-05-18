"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCheckPoints = void 0;
const orderbook_1 = require("./orderbook");
const trade_group_1 = require("./trade-group");
const merge_1 = require("../merge");
function makeCheckPoints(dataReader, adminTexMap) {
    const sortMergeCheckPoints = (0, merge_1.sortMerge)((a, b) => a.time - b.time);
    function makeOrderbookCheckPoints(marketName, adminTex) {
        return (0, orderbook_1.checkPointsFromDatabaseOrderbooks)(dataReader.getDatabaseOrderbooks(marketName, adminTex), adminTex);
    }
    function makeTradeGroupCheckPoints(marketName, adminTex) {
        return (0, trade_group_1.checkPointsFromDatabaseTradeGroups)(dataReader.getDatabaseTradeGroups(marketName, adminTex), adminTex);
    }
    return sortMergeCheckPoints(...[].concat(...[...adminTexMap].map(([marketName, adminTex]) => [
        makeOrderbookCheckPoints(marketName, adminTex),
        makeTradeGroupCheckPoints(marketName, adminTex)
    ])));
}
exports.makeCheckPoints = makeCheckPoints;
//# sourceMappingURL=maker.js.map