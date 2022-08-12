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
    constructor(filePath, DataTypes) {
        this.$s = (0, startable_1.createStartable)(() => this.rawStart(), () => this.rawStop());
        this.db = new Database(filePath, {
            readonly: true,
            fileMustExist: true,
        });
        this.orderbookReader = new orderbook_reader_1.OrderbookReader(this.db, DataTypes);
        this.tradeGroupReader = new trade_group_reader_1.TradeGroupReader(this.db, DataTypes);
    }
    getDatabaseOrderbooksAfterId(marketName, marketSpec, id, endTime) {
        this.$s.assertReadyState('getDatabaseOrderbooksAfterId');
        return this.orderbookReader.getDatabaseOrderbooksAfterId(marketName, marketSpec, Number.parseInt(id), endTime);
    }
    getDatabaseOrderbooksAfterTime(marketName, marketSpec, afterTime, endTime) {
        this.$s.assertReadyState('getDatabaseOrderbooksAfterTime');
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(marketName, marketSpec, afterTime, endTime);
    }
    getDatabaseTradeGroupsAfterId(marketName, marketSpec, id, endTime) {
        this.$s.assertReadyState('getDatabaseTradeGroupsAfterId');
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterId(marketName, marketSpec, Number.parseInt(id), endTime);
    }
    getDatabaseTradeGroupsAfterTime(marketName, marketSpec, afterTime, endTime) {
        this.$s.assertReadyState('getDatabaseTradeGroupsAfterTime');
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(marketName, marketSpec, afterTime, endTime);
    }
    async rawStart() { }
    async rawStop() {
        this.db.close();
    }
};
DataReader = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.dataFilePath)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.TexchangeDataTypes))
], DataReader);
exports.DataReader = DataReader;
//# sourceMappingURL=data-reader.js.map