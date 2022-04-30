"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
class DatabaseReader {
    constructor(filePath, adminTexMap, H) {
        this.adminTexMap = adminTexMap;
        this.H = H;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.db = new Database(filePath, {
            readonly: true,
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.db, this.adminTexMap, this.H);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.db, this.adminTexMap, this.H);
    }
    getDatabaseOrderbooks(marketName, afterOrderbookId) {
        return this.orderbookReader.getDatabaseOrderbooks(marketName, afterOrderbookId);
    }
    getDatabaseTradeGroups(marketName, afterTradeId) {
        return this.tradeGroupReader.getDatabaseTradeGroups(marketName, afterTradeId);
    }
    async start() { }
    async stop() {
        this.db.close();
    }
}
exports.DatabaseReader = DatabaseReader;
//# sourceMappingURL=database-reader.js.map