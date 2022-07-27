import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { HLike, StrategyLike, HFactory } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { DataReader } from '../data-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { Texchange } from 'texchange';
import { Tecretary } from '../tecretary';
export declare abstract class Container<H extends HLike<H>> extends BaseContainer {
    abstract [TYPES.config]: () => Config;
    [TYPES.progressReader]: () => ProgressReader<H>;
    abstract [TYPES.startTime]: () => number;
    abstract [TYPES.progressFilePath]: () => string;
    [TYPES.dataReader]: () => DataReader<H>;
    abstract [TYPES.dataFilePath]: () => string;
    abstract [TYPES.texchangeMap]: () => Map<string, Texchange<H>>;
    [TYPES.timeline]: () => Timeline;
    abstract [TYPES.endTime]: () => number;
    [TYPES.context]: () => Context<H>;
    abstract [TYPES.strategy]: () => StrategyLike;
    abstract [TYPES.hFactory]: () => HFactory<H>;
    [TYPES.tecretary]: () => Tecretary<H>;
}
