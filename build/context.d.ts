import { MarketLike, ContextLike, HLike, TimelineLike } from 'secretary-like';
import { Latency } from 'texchange/build/facades.d/latency';
export declare class Context<H extends HLike<H>> implements ContextLike<H> {
    timeline: TimelineLike;
    [marketId: number]: MarketLike<H>;
    constructor(userTexes: Latency<H>[], timeline: TimelineLike);
    submit(key: string, json: string): Promise<void>;
}
