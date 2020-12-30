/// <reference types="node" />
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import { ContextAccountLike, ContextMarketLike, ContextLike, Config } from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
import Big from 'big.js';
declare class Context extends EventEmitter implements ContextLike {
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    escape: <T>(v: T) => Promise<T>;
    [marketId: number]: ContextMarket;
    constructor(texchange: Texchange, config: Config, sleep: (ms: number) => Promise<void>, now: () => number, escape: <T>(v: T) => Promise<T>);
}
declare class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    PRICE_DP: number;
    QUANTITY_DP: number;
    CURRENCY_DP: number;
    calcDollarVolume: (price: Big, quantity: Big) => Big;
    constructor(texchange: Texchange, config: Config);
}
declare class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike {
    leverage: number;
    MAKER_FEE_RATE: number;
    TAKER_FEE_RATE: number;
    constructor(texchange: Texchange, config: Config);
}
export { Context as default, Context, };
