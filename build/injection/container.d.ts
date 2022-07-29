import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { HLike, HFactory, HStatic, StrategyLike, StrategyStaticLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReaderLike } from '../progress-reader-like';
import { DataReaderLike } from '../data-reader-like';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { Texchange, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
import { Tecretary } from '../tecretary';
export declare abstract class Container<H extends HLike<H>> extends BaseContainer {
    abstract [TYPES.config]: () => Config;
    [TYPES.TexchangeDataTypes]: () => TexchangeDataTypesNamespace<H>;
    [TYPES.progressReader]: () => ProgressReaderLike<H>;
    abstract [TYPES.startTime]: () => number;
    abstract [TYPES.progressFilePath]: () => string;
    [TYPES.dataReader]: () => DataReaderLike<H>;
    abstract [TYPES.dataFilePath]: () => string;
    abstract [TYPES.texchangeMap]: () => Map<string, Texchange<H>>;
    [TYPES.timeline]: () => Timeline;
    abstract [TYPES.endTime]: () => number;
    [TYPES.context]: () => Context<H>;
    abstract [TYPES.Strategy]: () => StrategyStaticLike<H>;
    [TYPES.strategy]: () => StrategyLike;
    abstract [TYPES.hFactory]: () => HFactory<H>;
    abstract [TYPES.hStatic]: () => HStatic<H>;
    [TYPES.tecretary]: () => Tecretary<H>;
}
