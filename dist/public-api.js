import { EventEmitter } from 'events';
class ContextMarketPublicApi extends EventEmitter {
    constructor(texchange) {
        super();
        this.texchange = texchange;
        this.onOrderbook = (orderbook) => {
            this.emit('orderbook', orderbook);
        };
        this.onTrades = (trades) => {
            this.emit('trades', trades);
        };
        this.texchange.on('orderbook', this.onOrderbook);
        this.texchange.on('trades', this.onTrades);
    }
}
export { ContextMarketPublicApi as default, ContextMarketPublicApi, };
//# sourceMappingURL=public-api.js.map