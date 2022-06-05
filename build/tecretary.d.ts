import { Startable } from 'startable';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> {
    private config;
    private progressReader;
    private timeline;
    private texMap;
    private strategy;
    private H;
    private dataReader;
    private adminTexMap;
    startable: Startable;
    constructor(config: Config, progressReader: ProgressReader, timeline: Timeline, texMap: Map<string, Texchange<H>>, strategy: StrategyLike, H: HStatic<H>);
    private capture;
    private start;
    private stop;
}
