"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
class Context {
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
}
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