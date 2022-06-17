"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataReader = void 0;
const startable_1 = require("startable");
const Database = require("better-sqlite3");
const orderbook_reader_1 = require("./orderbook-reader");
const trade_group_reader_1 = require("./trade-group-reader");
const types_1 = require("../injection/types");
const injektor_1 = require("@zimtsui/injektor");
let DataReader = class DataReader {
    constructor(filePath, H) {
        this.startable = startable_1.Startable.create(() => this.rawStart(), () => this.rawStop());
        this.start = this.startable.start;
        this.stop = this.startable.stop;
        this.assart = this.startable.assart;
        this.starp = this.startable.starp;
        this.getReadyState = this.startable.getReadyState;
        this.skipStart = this.startable.skipStart;
        this.db = new Database(filePath, {
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
    async rawStart() { }
    async rawStop() {
        this.db.close();
    }
};
DataReader = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.dataFilePath)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.hStatic))
], DataReader);
exports.DataReader = DataReader;
//# sourceMappingURL=data-reader.js.map