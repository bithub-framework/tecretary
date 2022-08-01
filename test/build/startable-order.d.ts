import { HLike, ContextLike, LimitOrder } from 'secretary-like';
export declare class StartableOrder<H extends HLike<H>> {
    private latest;
    private goal;
    private ctx;
    $s: import("startable").Startable<[source: LimitOrder.Source<H>, latest: H, goal: H]>;
    private openOrder?;
    private limitOrder?;
    constructor(latest: H, goal: H, ctx: ContextLike<H>);
    private onPositions;
    private rawStart;
    private rawStop;
    getLatest(): H;
    getGoal(): H;
    getLimitOrder(): LimitOrder<H>;
    private getOpenOrder;
}
export declare class Fulfilled extends Error {
}
