/// <reference types="node" />
import { EventEmitter } from 'events';
import { Assets, LimitOrder, Orderbook, OrderId, RawTrade, Open } from './interfaces';
declare class Texchange extends EventEmitter {
    private assets;
    private sleep;
    private now;
    private tradeCount;
    private orderCount;
    private openOrders;
    private incBook;
    private cost;
    constructor(assets: Assets, sleep: (ms: number) => Promise<void>, now: () => number);
    makeLimitOrder(order: LimitOrder, open?: Open): Promise<OrderId>;
    cancelOrder(oid: OrderId): Promise<void>;
    updateTrades(trades: RawTrade[]): void;
    updateOrderbook(orderbook: Orderbook): void;
    private settle;
    private initialMargin;
    private orderTakes;
    private orderMakes;
    private pushOrderbook;
    private pushTrades;
}
export { Texchange as default, Texchange, };
