"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
const snapshot_reader_1 = require("./snapshot-reader");
class DatabaseReader {
    constructor(config, adminTexMap, H) {
        this.adminTexMap = adminTexMap;
        this.H = H;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.dataDb = new Database(config.DATA_DB_FILE_PATH, {
            readonly: true,
            fileMustExist: true,
        });
        this.projectsDb = new Database(config.PROJECTS_DB_FILE_PATH, {
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.dataDb, this.adminTexMap, this.H);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.dataDb, this.adminTexMap, this.H);
        this.snapshotReader = new snapshot_reader_1.SnapshotReader(this.projectsDb, config);
    }
    getDatabaseOrderbooks(marketName, afterOrderbookId) {
        return this.orderbookReader.getDatabaseOrderbooks(marketName, afterOrderbookId);
    }
    getDatabaseTradeGroups(marketName, afterTradeId) {
        return this.tradeGroupReader.getDatabaseTradeGroups(marketName, afterTradeId);
    }
    getSnapshot(marketName) {
        return this.snapshotReader.getSnapshot(marketName);
    }
    setSnapshot(marketName, snapshot) {
        this.snapshotReader.setSnapshot(marketName, snapshot);
    }
    async start() { }
    async stop() {
        this.dataDb.close();
    }
}
exports.DatabaseReader = DatabaseReader;
//# sourceMappingURL=database-reader.js.map