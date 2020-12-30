import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import { EventEmitter } from 'events';
class Context extends EventEmitter {
    constructor(texchange, config, sleep, now, escape) {
        super();
        this.sleep = sleep;
        this.now = now;
        this.escape = escape;
        this[0] = new ContextMarket(texchange, config);
    }
}
class ContextMarket extends ContextMarketPublicApi {
    constructor(texchange, config) {
        super(texchange);
        this[0] = new ContextAccount(texchange, config);
        ({
            PRICE_DP: this.PRICE_DP,
            QUANTITY_DP: this.QUANTITY_DP,
            CURRENCY_DP: this.CURRENCY_DP,
            calcDollarVolume: this.calcDollarVolume,
        } = config);
    }
}
class ContextAccount extends ContextAccountPrivateApi {
    constructor(texchange, config) {
        super(texchange);
        ({
            leverage: this.leverage,
            MAKER_FEE_RATE: this.MAKER_FEE_RATE,
            TAKER_FEE_RATE: this.TAKER_FEE_RATE,
        } = config);
    }
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map