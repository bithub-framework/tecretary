"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
class DataReader {
    constructor(config, progressReader, H) {
        this.progressReader = progressReader;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(config.DATA_DB_FILE_PATH, {
            readonly: true,
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.db, H);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.db, H);
    }
    getDatabaseOrderbooks(marketName, adminTex) {
        const afterOrderbookId = adminTex.getLatestDatabaseOrderbookId();
        if (afterOrderbookId !== null)
            return this.orderbookReader.getDatabaseOrderbooksAfterOrderbookId(marketName, adminTex, Number.parseInt(afterOrderbookId));
        else
            return this.orderbookReader.getDatabaseOrderbooksAfterTime(marketName, adminTex, this.progressReader.getTime());
    }
    getDatabaseTradeGroups(marketName, adminTex) {
        const afterTradeId = adminTex.getLatestDatabaseTradeId();
        if (afterTradeId !== null)
            return this.tradeGroupReader.getDatabaseTradeGroupsAfterTradeId(marketName, adminTex, Number.parseInt(afterTradeId));
        else
            return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(marketName, adminTex, this.progressReader.getTime());
    }
    async start() { }
    async stop() {
        this.db.close();
    }
}
exports.DataReader = DataReader;
//# sourceMappingURL=data-reader.js.map