"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMarket = void 0;
const events_1 = require("events");
const account_1 = require("./account");
class ContextMarket extends events_1.EventEmitter {
    constructor(texchange) {
        super();
        this.facade = texchange.getUserMarketFacade();
        this.PRICE_SCALE = this.facade.PRICE_SCALE;
        this.QUANTITY_SCALE = this.facade.QUANTITY_SCALE;
        this.CURRENCY_SCALE = this.facade.CURRENCY_SCALE;
        this.TICK_SIZE = this.facade.TICK_SIZE;
        this.MARKET_NAME = this.facade.MARKET_NAME;
        this.facade.on('orderbook', orderbook => {
            this.emit('orderbook', orderbook);
        });
        this.facade.on('trades', trades => {
            this.emit('trades', trades);
        });
        this.facade.on('error', error => {
            this.emit('error', error);
        });
        this[0] = new account_1.ContextAccout(texchange);
    }
    quantity(price, dollarVolume) {
        return this.facade.quantity(price, dollarVolume);
    }
    ;
    dollarVolume(price, quantity) {
        return this.facade.dollarVolume(price, quantity);
    }
}
exports.ContextMarket = ContextMarket;
//# sourceMappingURL=market.js.map