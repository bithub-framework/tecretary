import {
    ContextMarketPublicApiLike,
    Orderbook,
    Trade,
} from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';

class ContextMarketPublicApi extends EventEmitter implements ContextMarketPublicApiLike {
    constructor(
        texchange: Texchange,
    ) {
        super();
        texchange.on('orderbook', this.onOrderbook);
        texchange.on('trades', this.onTrades);
    }

    private onOrderbook = (orderbook: Orderbook) => {
        this.emit('orderbook', orderbook);
    };

    private onTrades = (trades: Trade[]) => {
        this.emit('trades', trades);
    };
}

export {
    ContextMarketPublicApi as default,
    ContextMarketPublicApi,
}
