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
exports.EndOfData = exports.Tecretary = void 0;
const startable_1 = require("startable");
const orderbook_1 = require("./check-points/orderbook");
const trade_group_1 = require("./check-points/trade-group");
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./injection/types");
const shiftable_1 = require("shiftable");
const coroutine_locks_1 = require("@zimtsui/coroutine-locks");
let Tecretary = class Tecretary {
    constructor(config, progressReader, timeline, texchangeMap, strategy, hFactory, dataReader, endTime) {
        this.config = config;
        this.progressReader = progressReader;
        this.timeline = timeline;
        this.texchangeMap = texchangeMap;
        this.strategy = strategy;
        this.hFactory = hFactory;
        this.dataReader = dataReader;
        this.startable = startable_1.Startable.create(() => this.rawStart(), () => this.rawStop());
        this.start = this.startable.start;
        this.stop = this.startable.stop;
        this.assart = this.startable.assart;
        this.starp = this.startable.starp;
        this.getReadyState = this.startable.getReadyState;
        this.skipStart = this.startable.skipStart;
        this.realMachine = startable_1.Startable.create(() => this.realMachineRawStart(), () => this.realMachineRawStop());
        this.virtualMachine = startable_1.Startable.create(() => this.virtualMachineRawStart(), () => this.virtualMachineRawStop());
        this.tradeGroupsMap = new Map();
        this.orderbooksMap = new Map();
        for (const [name, texchange] of this.texchangeMap) {
            const facade = texchange.getAdminFacade();
            const marketSpec = facade.getMarketSpec();
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                facade.restore(snapshot);
            const bookId = facade.getLatestDatabaseOrderbookId();
            const orderbooks = bookId !== null
                ? this.dataReader.getDatabaseOrderbooksAfterId(name, marketSpec, bookId, endTime) : this.dataReader.getDatabaseOrderbooksAfterTime(name, marketSpec, this.progressReader.getTime(), endTime);
            this.orderbooksMap.set(name, orderbooks);
            this.timeline.merge(shiftable_1.Shifterator.fromIterable((0, orderbook_1.makeOrderbookCheckPoints)(orderbooks, texchange)));
            const tradeId = facade.getLatestDatabaseTradeId();
            const tradeGroups = tradeId !== null
                ? this.dataReader.getDatabaseTradeGroupsAfterId(name, marketSpec, tradeId, endTime) : this.dataReader.getDatabaseTradeGroupsAfterTime(name, marketSpec, this.progressReader.getTime(), endTime);
            this.tradeGroupsMap.set(name, tradeGroups);
            this.timeline.merge(shiftable_1.Shifterator.fromIterable((0, trade_group_1.makeTradeGroupCheckPoints)(tradeGroups, texchange)));
        }
        this.timeline.merge(shiftable_1.Shifterator.fromIterable([{
                time: endTime,
                cb: async () => {
                    this.starp(new EndOfData('End of data.'));
                }
            }]));
        // this.timeline.affiliate(
        //	 Shifterator.fromIterable(
        //		 makePeriodicCheckPoints(
        //			 this.timeline.now(),
        //			 this.config.snapshotPeriod,
        //			 () => this.capture(),
        //		 ),
        //	 ),
        // );
    }
    capture() {
        this.progressReader.capture(this.timeline.now(), this.texchangeMap);
    }
    async realMachineRawStart() {
        await this.progressReader.start(this.realMachine.starp);
        await this.dataReader.start(this.realMachine.starp);
        await this.timeline.start(this.realMachine.starp);
    }
    async realMachineRawStop() {
        await this.timeline.stop();
        this.capture();
        for (const tradeGroups of this.tradeGroupsMap.values())
            tradeGroups.return();
        for (const orderbooks of this.orderbooksMap.values())
            orderbooks.return();
        await this.dataReader.stop();
        await this.progressReader.stop();
    }
    async virtualMachineRawStart() {
        for (const [name, texchange] of this.texchangeMap) {
            const facade = texchange.getAdminFacade();
            await facade.start(this.virtualMachine.starp);
        }
        this.strategyRunning = new coroutine_locks_1.Rwlock();
        this.strategyRunning.trywrlock();
        await this.strategy.start(err => {
            if (err)
                this.strategyRunning.throw(err);
            else
                this.strategyRunning.unlock();
            this.virtualMachine.starp(err);
        });
    }
    async virtualMachineRawStop(err) {
        if (err instanceof EndOfData) {
            for (const [name, texchange] of this.texchangeMap) {
                const facade = texchange.getAdminFacade();
                await facade.stop(new EndOfData('End of data.'));
            }
            if (this.strategyRunning) {
                await this.strategyRunning.rdlock().catch(() => { });
                await this.strategy.stop();
            }
        }
        else {
            await this.strategy.stop();
            for (const [name, texchange] of this.texchangeMap) {
                const facade = texchange.getAdminFacade();
                await facade.stop();
            }
        }
    }
    async rawStart() {
        this.realMachineRunning = new coroutine_locks_1.Rwlock();
        this.realMachineRunning.trywrlock();
        await this.realMachine.start(err => {
            if (err)
                this.realMachineRunning.throw(err);
            else
                this.realMachineRunning.unlock();
            this.starp(err);
        });
        await Promise.any([
            this.realMachineRunning.rdlock(),
            this.virtualMachine.start(this.starp),
        ]);
    }
    async rawStop(err) {
        try {
            if (this.realMachineRunning)
                await Promise.any([
                    this.realMachineRunning.rdlock(),
                    this.virtualMachine.stop(),
                ]);
        }
        finally {
            this.capture();
            await this.timeline.stop();
            for (const tradeGroups of this.tradeGroupsMap.values())
                tradeGroups.return();
            for (const orderbooks of this.orderbooksMap.values())
                orderbooks.return();
            await this.dataReader.stop();
            await this.progressReader.stop();
        }
    }
};
Tecretary = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.config)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.progressReader)),
    __param(2, (0, injektor_1.inject)(types_1.TYPES.timeline)),
    __param(3, (0, injektor_1.inject)(types_1.TYPES.texchangeMap)),
    __param(4, (0, injektor_1.inject)(types_1.TYPES.strategy)),
    __param(5, (0, injektor_1.inject)(types_1.TYPES.hFactory)),
    __param(6, (0, injektor_1.inject)(types_1.TYPES.dataReader)),
    __param(7, (0, injektor_1.inject)(types_1.TYPES.endTime))
], Tecretary);
exports.Tecretary = Tecretary;
class EndOfData extends Error {
}
exports.EndOfData = EndOfData;
//# sourceMappingURL=tecretary.js.map