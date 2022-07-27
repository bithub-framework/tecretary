import { ReadyState, StartableLike } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
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
    constructor(config: Config, progressReader: ProgressReader<H>, timeline: Timeline, texchangeMap: Map<string, Texchange<H>>, strategy: StrategyLike, hFactory: HFactory<H>, dataReader: DataReader<H>, endTime: number);
    private capture;
    private rawStart;
    private rawStop;
}
