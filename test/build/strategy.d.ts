import { StrategyLike, ContextLike, HLike } from 'secretary-like';
export declare class Strategy<H extends HLike<H>> implements StrategyLike {
    private ctx;
    $s: import("startable").Startable<[]>;
    private latestPrice;
    private poller;
    private pc;
    constructor(ctx: ContextLike<H>);
    private loop;
    private onTrades;
    private onOrderbook;
    private onceOrderbook;
    private onError;
    private rawStart;
    private rawStop;
}
