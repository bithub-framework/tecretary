/// <reference types="node" />
import { EventEmitter } from 'events';
import { Assets, LimitOrder, Orderbook, OrderId, RawTrade } from './interfaces';
declare class Texchange extends EventEmitter {
    private assets;
    private sleep;
    private now;
    private tradeCount;
    private orderCount;
    private openOrders;
    private incBook;
    constructor(assets: Assets, sleep: (ms: number) => Promise<void>, now: () => number);
    makeLimitOrder(order: LimitOrder, open?: boolean): Promise<OrderId>;
    cancelOrder(oid: OrderId): Promise<void>;
    updateTrades(trades: RawTrade[]): void;
    updateOrderbook(orderbook: Orderbook): void;
    private settle;
    private orderTakes;
    private orderMakes;
    private pushOrderbook;
    private pushTrades;
    private calcAssets;
}
export { Texchange as default, Texchange, };
