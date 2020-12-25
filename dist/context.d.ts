/// <reference types="node" />
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import { ContextAccountLike, ContextMarketLike, ContextLike } from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
declare class Context extends EventEmitter implements ContextLike {
    sleep: (ms: number) => Promise<void>;
    now: () => number;
    escape: <T>(v: T) => Promise<T>;
    [marketId: number]: ContextMarket;
    constructor(texchange: Texchange, sleep: (ms: number) => Promise<void>, now: () => number, escape: <T>(v: T) => Promise<T>);
}
declare class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;
    constructor(texchange: Texchange);
}
declare class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike {
}
export { Context as default, Context, };
