import { Startable } from 'startable';
import { ProgressReader } from './progress-reader';
import { Context } from './context';
import { Texchange } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic, StrategyLike } from 'secretary-like';
import { Timeline } from './timeline/timeline';
export declare class Tecretary<H extends HLike<H>> {
    private config;
    private progressReader;
    private timeline;
    private texMap;
    private context;
    private strategy;
    private H;
    private dataReader;
    private adminTexMap;
    private checkPointsMaker;
    startable: Startable;
    constructor(config: Config, progressReader: ProgressReader, timeline: Timeline, texMap: Map<string, Texchange<H>>, context: Context<H>, strategy: StrategyLike, H: HStatic<H>);
    private start;
    private stop;
}
