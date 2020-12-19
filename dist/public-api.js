import { EventEmitter } from 'events';
class ContextMarketPublicApi extends EventEmitter {
    constructor(texchange) {
        super();
        this.onOrderbook = (orderbook) => {
            this.emit('orderbook', orderbook);
        };
        this.onTrades = (trades) => {
            this.emit('trades', trades);
        };
        texchange.on('orderbook', this.onOrderbook);
        texchange.on('trades', this.onTrades);
    }
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
//# sourceMappingURL=public-api.js.map