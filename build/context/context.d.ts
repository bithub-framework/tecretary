import { MarketLike, ContextLike, HLike, TimelineLike, DataTypesNamespace as SecretaryDataTypesNamespace } from 'secretary-like';
import { Texchange } from 'texchange';
import { ProgressReader } from '../progress-reader';
import { Config } from '../config';
export declare class Context<H extends HLike<H>> implements ContextLike<H> {
    DataTypes: SecretaryDataTypesNamespace<H>;
    timeline: TimelineLike;
    private progressReader;
    [marketId: number]: MarketLike<H>;
    $s: import("startable").Startable;
    private texchanges;
    constructor(config: Config, texchangeMap: Map<string, Texchange<H>>, DataTypes: SecretaryDataTypesNamespace<H>, timeline: TimelineLike, progressReader: ProgressReader<H>);
    submit(content: string): void;
    private rawStart;
    private rawStop;
}
