import { MarketLike, ContextLike, HLike, TimelineLike } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange/texchange';
import { ProgressReader } from '../progress-reader';
import { Config } from '../config';
export declare class Context<H extends HLike<H>> implements ContextLike<H> {
    timeline: TimelineLike;
    private progressReader;
    [marketId: number]: MarketLike<H>;
    constructor(config: Config, texchangeMap: Map<string, Texchange<H>>, timeline: TimelineLike, progressReader: ProgressReader);
    submit(content: string): void;
}
