import { MarketLike, ContextLike, HLike, TimelineLike } from 'secretary-like';
import { UserTex } from 'texchange/build/texchange';
import { ProgressReader } from './progress-reader';
export declare class Context<H extends HLike<H>> implements ContextLike<H> {
    timeline: TimelineLike;
    private progressReader;
    [marketId: number]: MarketLike<H>;
    constructor(userTexes: UserTex<H>[], timeline: TimelineLike, progressReader: ProgressReader);
    submit(content: string): void;
}
