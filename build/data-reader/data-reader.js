"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
class DataReader {
    constructor(config, adminTexMap, H) {
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.DATA_DB_FILE_PATH, {
            readonly: true,
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.db, adminTexMap, H);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.db, adminTexMap, H);
    }
    getDatabaseOrderbooksAfterOrderbookId(marketName, afterOrderbookId) {
        return this.orderbookReader.getDatabaseOrderbooksAfterOrderbookId(marketName, afterOrderbookId);
    }
    getDatabaseOrderbooksAfterTime(marketName, afterTime) {
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(marketName, afterTime);
    }
    getDatabaseTradeGroupsAfterTradeId(marketName, afterTradeId) {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTradeId(marketName, afterTradeId);
    }
    getDatabaseTradeGroupsAfterTime(marketName, afterTime) {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(marketName, afterTime);
    }
    async start() { }
    async stop() {
        this.db.close();
    }
}
exports.DataReader = DataReader;
//# sourceMappingURL=data-reader.js.map