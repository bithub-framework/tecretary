import { DataReaderLike } from './data-reader-like';
import { ProgressReaderLike } from './progress-reader-like';
import { Texchange } from 'texchange';
import { Config } from './config';
import { HLike, HFactory, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> {
    private config;
    private progressReader;
    private timeline;
    private texchangeMap;
    private strategy;
    private hFactory;
    private dataReader;
    $s: import("startable").Startable;
    private realMachine;
    private virtualMachine;
    private strategyRunning?;
    private tradeGroupsMap;
    private orderbooksMap;
    constructor(config: Config, progressReader: ProgressReaderLike<H>, timeline: Timeline, texchangeMap: Map<string, Texchange<H>>, strategy: StrategyLike, hFactory: HFactory<H>, dataReader: DataReaderLike<H>, endTime: number);
    private capture;
    private realMachineRawStart;
    private realMachineRawStop;
    private virtualMachineRawStart;
    private virtualMachineRawStop;
    private rawStart;
    private rawStop;
}
