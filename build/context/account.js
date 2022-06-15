"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAccout = void 0;
class ContextAccout {
    constructor(texchange) {
        this.facade = texchange.getUserAccountFacade();
        this.spec = this.facade.spec;
        this.events = this.facade.events;
    }
    async makeOrders($orders) {
        return await this.facade.makeOrders($orders);
    }
    async amendOrders($amendments) {
        return await this.facade.amendOrders($amendments);
    }
    async cancelOrders($orders) {
        return await this.facade.cancelOrders($orders);
    }
    async getBalances() {
        return await this.facade.getBalances();
    }
    async getPositions() {
        return await this.facade.getPositions();
    }
    async getOpenOrders() {
        return await this.facade.getOpenOrders();
    }
}
exports.ContextAccout = ContextAccout;
//# sourceMappingURL=account.js.map