"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAccout = void 0;
const events_1 = require("events");
class ContextAccout extends events_1.EventEmitter {
    constructor(texchange) {
        super();
        this.facade = texchange.getUserAccountFacade();
        this.$s = texchange.getAdminFacade().$s;
        this.LEVERAGE = this.facade.LEVERAGE;
        this.TAKER_FEE_RATE = this.facade.TAKER_FEE_RATE;
        this.MAKER_FEE_RATE = this.facade.MAKER_FEE_RATE;
        this.facade.on('positions', positions => {
            this.emit('positions', positions);
        });
        this.facade.on('balances', balances => {
            this.emit('balances', balances);
        });
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