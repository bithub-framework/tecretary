import { HLike, ContextLike, Orderbook } from 'secretary-like';
import { Throttle } from './throttle';
export declare class AutoOrder<H extends HLike<H>> {
    private latest;
    private goal;
    private ctx;
    private throttle;
    $s: import("startable").Startable<[]>;
    private openOrder?;
    private limitOrder;
    constructor(orderbook: Orderbook<H>, latest: H, goal: H, ctx: ContextLike<H>, throttle: Throttle);
    private onPositions;
    private onOrderbook;
    private rawStart;
    private rawStop;
    getLatest(): H;
}
export declare class OrderbookMoving extends Error {
}
