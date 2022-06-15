"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMarket = void 0;
const account_1 = require("./account");
class ContextMarket {
    constructor(texchange) {
        this.facade = texchange.getUserMarketFacade();
        this.spec = this.facade.spec;
        this.events = this.facade.events;
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