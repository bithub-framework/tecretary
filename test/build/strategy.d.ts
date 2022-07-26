import { StrategyLike, ContextLike, HLike } from 'secretary-like';
export declare class Strategy<H extends HLike<H>> implements StrategyLike {
    private ctx;
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => import("startable").ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    private latestPrice;
    private bought;
    private poller;
    constructor(ctx: ContextLike<H>);
    private loop;
    private onTrades;
    private onOrderbook;
    private rawStart;
    private rawStop;
}
