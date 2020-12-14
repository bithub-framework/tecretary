import {
    ContextMarketPublicApiLike,
    Orderbook,
    Trade,
    InstanceConfig,
    BID,
    ASK,
} from './interfaces';
import TtlQueue from 'ttl-queue';
import Startable from 'startable';
import secretaryConfig from 'secretary/dist/config';
import { EventEmitter } from 'events';
import { Texchange } from 'texchange';

class ContextMarketPublicApi extends Startable implements ContextMarketPublicApiLike {
    public orderbook: Orderbook;
    public trades: TtlQueue<Trade>;
    private oSocket: EventEmitter;
    private tSocket: EventEmitter;

    constructor(
        instanceConfig: InstanceConfig,
        mid: number,
        private texchange: Texchange,
    ) {
        super();

        this.trades = new TtlQueue<Trade>({
            ttl: instanceConfig.TRADE_TTL,
            cleaningInterval: secretaryConfig.CLEANING_INTERVAL,
        });
        this.orderbook = {
            [BID]: [], [ASK]: [], time: Number.NEGATIVE_INFINITY,
        }
        const marketConfig = instanceConfig.markets[mid];
        this.oSocket = this.texchange;
        this.tSocket = this.texchange;
    }

    protected async _start() {
        await this.trades.start(err => void this.stop(err).catch(() => { }));
        this.oSocket.on('orderbook', this.onOrderbook);
        this.tSocket.on('trades', this.onTrades);
    }

    protected async _stop() {
        this.oSocket.off('orderbook', this.onOrderbook);
        this.tSocket.off('trades', this.onTrades);
        await this.trades.stop();
    }

    private onOrderbook = (orderbook: Orderbook) => {
        try {
            this.orderbook = orderbook;
            this.emit('orderbook', orderbook);
        } catch (err) {
            this.stop().catch(() => { });
        }
    };

    private onTrades = (trades: Trade[]) => {
        try {
            trades.forEach(trade => void this.trades.push(trade, trade.time));
            this.emit('trades', trades);
        } catch (err) {
            this.stop().catch(() => { });
        }
    };
}

export {
    ContextMarketPublicApi as default,
    ContextMarketPublicApi,
}
