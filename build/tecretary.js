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
const check_points_1 = require("./check-points");
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./injection/types");
const shiftable_1 = require("shiftable");
const assert = require("assert");
let Tecretary = class Tecretary {
    constructor(config, progressReader, timeline, texchangeMap, strategy, H, dataReader) {
        this.config = config;
        this.progressReader = progressReader;
        this.timeline = timeline;
        this.texchangeMap = texchangeMap;
        this.strategy = strategy;
        this.H = H;
        this.dataReader = dataReader;
        this.startable = startable_1.Startable.create(() => this.start(), () => this.stop());
        this.adminFacadeMap = new Map([...this.texchangeMap].map(([name, texchange]) => [name, texchange.getAdminFacade()]));
        for (const [name, tex] of this.adminFacadeMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }
        for (const [marketName, adminTex] of this.adminFacadeMap) {
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
        this.timeline.affiliate(shiftable_1.Shifterator.fromIterable((0, check_points_1.makePeriodicCheckPoints)(this.timeline.now(), this.config.snapshotPeriod, () => this.capture())));
    }
    capture() {
        this.progressReader.capture(this.timeline.now(), this.adminFacadeMap);
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
    __param(3, (0, injektor_1.inject)(types_1.TYPES.TexchangeMap)),
    __param(4, (0, injektor_1.inject)(types_1.TYPES.StrategyLike)),
    __param(5, (0, injektor_1.inject)(types_1.TYPES.HStatic)),
    __param(6, (0, injektor_1.inject)(types_1.TYPES.DataReader))
], Tecretary);
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map