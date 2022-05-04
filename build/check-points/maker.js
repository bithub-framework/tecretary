"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPointsMaker = void 0;
const orderbook_1 = require("./orderbook");
const trade_group_1 = require("./trade-group");
const merge_1 = require("../merge");
const sortMergeCheckPoints = (0, merge_1.sortMerge)((a, b) => a.time - b.time);
class CheckPointsMaker {
    constructor(dataReader, adminTexMap) {
        this.dataReader = dataReader;
        this.adminTexMap = adminTexMap;
    }
    make() {
        return sortMergeCheckPoints(...[].concat(...[...this.adminTexMap].map(([marketName, adminTex]) => [
            this.makeOrderbookCheckPoints(marketName, adminTex),
            this.makeTradeGroupCheckPoints(marketName, adminTex)
        ])));
    }
    makeOrderbookCheckPoints(marketName, adminTex) {
        return (0, orderbook_1.checkPointsFromDatabaseOrderbooks)(this.dataReader.getDatabaseOrderbooks(marketName, adminTex), adminTex);
    }
    makeTradeGroupCheckPoints(marketName, adminTex) {
        return (0, trade_group_1.checkPointsFromDatabaseTradeGroups)(this.dataReader.getDatabaseTradeGroups(marketName, adminTex), adminTex);
    }
}
exports.CheckPointsMaker = CheckPointsMaker;
//# sourceMappingURL=maker.js.map