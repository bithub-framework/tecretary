import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange/texchange';
import { Config } from './config';
import { HLike, HStatic, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> {
    private config;
    private progressReader;
    private timeline;
    private texchangeMap;
    private strategy;
    private H;
    private dataReader;
    private adminFacadeMap;
    startable: import("startable/build/startable").Startable;
    constructor(config: Config, progressReader: ProgressReader, timeline: Timeline, texchangeMap: Map<string, Texchange<H>>, strategy: StrategyLike, H: HStatic<H>, dataReader: DataReader<H>);
    private capture;
    private start;
    private stop;
}
