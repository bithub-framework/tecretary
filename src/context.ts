import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import {
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
    Config,
    Assets,
} from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
import Big from 'big.js';
import fetch from 'node-fetch';
import assert from 'assert';
import { REDIRECTOR_URL } from './config';

class Context extends EventEmitter implements ContextLike {
    [marketId: number]: ContextMarket;

    constructor(
        texchange: Texchange,
        private config: Config,
        public setTimeout: (cb: () => void, ms: number) => any,
        public clearTimeout: (timerId: any) => void,
        public sleep: (ms: number) => Promise<void>,
        public now: () => number,
        public escape: <T>(v: T) => Promise<T>,
    ) {
        super();
        this[0] = new ContextMarket(texchange, config);
    }

    public async submitAssets(assets: Assets) {
        const res = await this.escape(fetch(
            `${REDIRECTOR_URL}/secretariat/assets?id=${this.config.projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assets),
        }));
        assert(res.ok);
    }
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    public PRICE_DP: number;
    public QUANTITY_DP: number;
    public CURRENCY_DP: number;
    public MINIMUM_PRICE_INC: Big;
    public calcDollarVolume: (price: Big, quantity: Big) => Big;
    public calcQuantity: (price: Big, dollarVolume: Big) => Big;

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
            MINIMUM_PRICE_INC: this.MINIMUM_PRICE_INC,
            calcDollarVolume: this.calcDollarVolume,
            calcQuantity: this.calcQuantity,
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
