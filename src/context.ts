import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import {
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
    Config,
} from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
import Big from 'big.js';

class Context extends EventEmitter implements ContextLike {
    [marketId: number]: ContextMarket;

    constructor(
        texchange: Texchange,
        config: Config,
        public sleep: (ms: number) => Promise<void>,
        public now: () => number,
        public escape: <T>(v: T) => Promise<T>,
    ) {
        super();
        this[0] = new ContextMarket(texchange, config);
    }
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    public PRICE_DP: number;
    public QUANTITY_DP: number;
    public CURRENCY_DP: number;
    public calcDollarVolume: (price: Big, quantity: Big) => Big;

    constructor(
        texchange: Texchange,
        config: Config,
    ) {
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


class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike {
    public leverage: number;
    public MAKER_FEE_RATE: number;
    public TAKER_FEE_RATE: number;

    constructor(
        texchange: Texchange,
        config: Config,
    ) {
        super(texchange);
        ({
            leverage: this.leverage,
            MAKER_FEE_RATE: this.MAKER_FEE_RATE,
            TAKER_FEE_RATE: this.TAKER_FEE_RATE,
        } = config);
    }

}

export {
    Context as default,
    Context,
}
