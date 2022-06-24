import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { HLike, StrategyLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context/context';
import { Texchange } from 'texchange/build/texchange';
import { Tecretary } from '../tecretary';
export declare abstract class Container<H extends HLike<H>> extends BaseContainer {
    abstract [TYPES.config]: () => Config;
    [TYPES.progressReader]: () => ProgressReader<H>;
    [TYPES.timeline]: () => Timeline;
    abstract [TYPES.texchangeMap]: () => Map<string, Texchange<H>>;
    [TYPES.context]: () => Context<H>;
    abstract [TYPES.strategy]: () => StrategyLike;
    [TYPES.tecretary]: () => Tecretary<H>;
}
