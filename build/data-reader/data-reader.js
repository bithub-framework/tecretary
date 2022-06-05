"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
class DataReader {
    constructor(config, H) {
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.DATA_DB_FILE_PATH, {
            readonly: true,
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.db, H);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.db, H);
    }
    getDatabaseOrderbooksAfterId(marketName, adminTex, id) {
        return this.orderbookReader.getDatabaseOrderbooksAfterId(marketName, adminTex, Number.parseInt(id));
    }
    getDatabaseOrderbooksAfterTime(marketName, adminTex, time) {
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(marketName, adminTex, time);
    }
    getDatabaseTradeGroupsAfterId(marketName, adminTex, id) {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterId(marketName, adminTex, Number.parseInt(id));
    }
    getDatabaseTradeGroupsAfterTime(marketName, adminTex, time) {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(marketName, adminTex, time);
    }
    async start() { }
    async stop() {
        this.db.close();
    }
}
exports.DataReader = DataReader;
//# sourceMappingURL=data-reader.js.map