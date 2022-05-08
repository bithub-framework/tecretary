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
exports.Context = void 0;
const injektor_1 = require("injektor");
const types_1 = require("./injection/types");
let Context = class Context {
    constructor(userTexes, timeline, progressReader) {
        this.timeline = timeline;
        this.progressReader = progressReader;
        for (let i = 0; i < userTexes.length; i++) {
            this[i] = new ContextMarket(userTexes[i].market, userTexes[i].account);
        }
    }
    submit(content) {
        this.progressReader.log(content, this.timeline.now());
    }
};
Context = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.UserTexes)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.TimelineLike)),
    __param(2, (0, injektor_1.inject)(types_1.TYPES.ProgressReader))
], Context);
exports.Context = Context;
class ContextMarket {
    constructor(market, account) {
        this.market = market;
        this.spec = this.market.spec;
        this.events = this.market.events;
        this[0] = new ContextAccout(account);
    }
    quantity(price, dollarVolume) {
        return this.market.quantity(price, dollarVolume);
    }
    ;
    dollarVolume(price, quantity) {
        return this.market.dollarVolume(price, quantity);
    }
}
class ContextAccout {
    constructor(account) {
        this.account = account;
        this.spec = this.account.spec;
        this.events = this.account.events;
    }
    async makeOrders($orders) {
        return await this.account.makeOrders($orders);
    }
    async amendOrders($amendments) {
        return await this.account.amendOrders($amendments);
    }
    async cancelOrders($orders) {
        return await this.account.cancelOrders($orders);
    }
    async getBalances() {
        return await this.account.getBalances();
    }
    async getPositions() {
        return await this.account.getPositions();
    }
    async getOpenOrders() {
        return await this.account.getOpenOrders();
    }
}
//# sourceMappingURL=context.js.map