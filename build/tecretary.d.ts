import { ReadyState, StartableLike } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange';
import { HLike, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> implements StartableLike {
    private progressReader;
    private timeline;
    private texchangeMap;
    private strategy;
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
    constructor(progressReader: ProgressReader<H>, timeline: Timeline, texchangeMap: Map<string, Texchange<H>>, strategy: StrategyLike, dataReader: DataReader<H>, endTime: number);
    private capture;
    private rawStart;
    private rawStop;
}
