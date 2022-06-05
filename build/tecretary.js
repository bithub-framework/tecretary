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
exports.Tecretary = void 0;
const startable_1 = require("startable");
const data_reader_1 = require("./data-reader");
const check_points_1 = require("./check-points");
const injektor_1 = require("injektor");
const types_1 = require("./injection/types");
const shiftable_1 = require("shiftable");
const assert = require("assert");
let Tecretary = class Tecretary {
    constructor(config, progressReader, timeline, texMap, strategy, H) {
        this.config = config;
        this.progressReader = progressReader;
        this.timeline = timeline;
        this.texMap = texMap;
        this.strategy = strategy;
        this.H = H;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.adminTexMap = new Map([...this.texMap].map(([name, tex]) => [name, tex.admin]));
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }
        this.dataReader = new data_reader_1.DataReader(this.config, this.H);
        for (const [marketName, adminTex] of this.adminTexMap) {
            const bookId = adminTex.getLatestDatabaseOrderbookId();
            const orderbooks = bookId !== null
                ? this.dataReader.getDatabaseOrderbooksAfterId(marketName, adminTex, bookId)
                : this.dataReader.getDatabaseOrderbooksAfterTime(marketName, adminTex, this.progressReader.getTime());
            this.timeline.merge(shiftable_1.Shifterator.fromIterable((0, check_points_1.makeOrderbookCheckPoints)(orderbooks, adminTex)));
            const tradeId = adminTex.getLatestDatabaseTradeId();
            const tradeGroups = tradeId !== null
                ? this.dataReader.getDatabaseTradeGroupsAfterId(marketName, adminTex, tradeId)
                : this.dataReader.getDatabaseTradeGroupsAfterTime(marketName, adminTex, this.progressReader.getTime());
            this.timeline.merge(shiftable_1.Shifterator.fromIterable((0, check_points_1.makeTradeGroupCheckPoints)(tradeGroups, adminTex)));
        }
        this.timeline.affiliate(shiftable_1.Shifterator.fromIterable((0, check_points_1.makePeriodicCheckPoints)(this.timeline.now(), this.config.SNAPSHOT_PERIOD, () => this.capture())));
    }
    capture() {
        this.progressReader.capture(this.timeline.now(), this.adminTexMap);
    }
    async start() {
        await this.progressReader.startable.start(this.startable.starp);
        await this.dataReader.startable.start(this.startable.starp);
        await this.timeline.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
    }
    async stop() {
        try {
            assert(this.timeline.startable.getReadyState() === "STARTED" /* STARTED */);
            await this.strategy.startable.stop();
        }
        finally {
            this.capture();
            await this.timeline.startable.stop();
            await this.dataReader.startable.stop();
            await this.progressReader.startable.stop();
        }
    }
};
Tecretary = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.Config)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.ProgressReader)),
    __param(2, (0, injektor_1.inject)(types_1.TYPES.Timeline)),
    __param(3, (0, injektor_1.inject)(types_1.TYPES.TexMap)),
    __param(4, (0, injektor_1.inject)(types_1.TYPES.StrategyLike)),
    __param(5, (0, injektor_1.inject)(types_1.TYPES.HStatic))
], Tecretary);
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map