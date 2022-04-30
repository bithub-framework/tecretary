import { MarketLike, ContextLike, HLike, TimelineLike } from 'interfaces';
import { TradeId, OrderId } from 'texchange/build/interfaces';
import { Latency } from 'texchange/build/facades.d/latency';
export declare class Context<H extends HLike<H>> implements ContextLike<H, OrderId, TradeId> {
    timeline: TimelineLike;
    [marketId: number]: MarketLike<H, OrderId, TradeId>;
    constructor(userTexes: Latency<H>[], timeline: TimelineLike);
    submit(key: string, json: string): Promise<void>;
}
