/// <reference types="node" />
import { EventEmitter } from 'events';
import { Assets, LimitOrder, Orderbook, Side, OrderId, RawTrade } from './interfaces';
declare class Texchange extends EventEmitter {
    private assets;
    private sleep;
    private now;
    private tradeCount;
    private orderCount;
    private openOrders;
    private incBook;
    private settlementPrice;
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
declare class IncrementalBook {
    private baseBook;
    private total;
    private increment;
    setBase(origin: Orderbook): void;
    incQuantity(side: Side, price: number, increment: number): void;
    getQuantity(side: Side): Map<number, number>;
    apply(): void;
}
export { Texchange as default, Texchange, IncrementalBook, };
