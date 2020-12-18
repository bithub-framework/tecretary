/// <reference types="node" />
import { ContextMarketPublicApiLike } from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
declare class ContextMarketPublicApi extends EventEmitter implements ContextMarketPublicApiLike {
    private texchange;
    constructor(texchange: Texchange);
    private onOrderbook;
    private onTrades;
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
