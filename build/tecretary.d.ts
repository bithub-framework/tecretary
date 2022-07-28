import { ReadyState, StartableLike } from 'startable';
import { DataReaderLike } from './data-reader-like';
import { ProgressReaderLike } from './progress-reader-like';
import { Texchange } from 'texchange';
import { Config } from './config';
import { HLike, HFactory, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> implements StartableLike {
    private config;
    private progressReader;
    private timeline;
    private texchangeMap;
    private strategy;
    private hFactory;
    private dataReader;
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    private tradeGroupsMap;
    private orderbooksMap;
    constructor(config: Config, progressReader: ProgressReaderLike<H>, timeline: Timeline, texchangeMap: Map<string, Texchange<H>>, strategy: StrategyLike, hFactory: HFactory<H>, dataReader: DataReaderLike<H>, endTime: number);
    private capture;
    private rawStart;
    private stopForEndOfData;
    private stopForOtherReason;
    private rawStop;
}
export declare class EndOfData extends Error {
}
