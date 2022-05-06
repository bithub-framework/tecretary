import { MarketLike, ContextLike, HLike, TimelineLike } from 'secretary-like';
import { Latency } from 'texchange/build/facades.d/latency';
import { ProgressReader } from './progress-reader';
export declare class Context<H extends HLike<H>> implements ContextLike<H> {
    timeline: TimelineLike;
    private progressReader;
    [marketId: number]: MarketLike<H>;
    constructor(userTexes: Latency<H>[], timeline: TimelineLike, progressReader: ProgressReader);
    submit(content: string): void;
}
