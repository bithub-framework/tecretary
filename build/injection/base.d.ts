import { BaseContainer } from 'injektor';
import { TYPES } from './types';
import { HLike, StrategyLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { UserTex, Texchange } from 'texchange/build/texchange';
import { Tecretary } from '../tecretary';
export declare abstract class Container<H extends HLike<H>> extends BaseContainer {
    private config;
    constructor(config: Config);
    [TYPES.Config]: () => Config;
    [TYPES.ProgressReader]: () => ProgressReader;
    [TYPES.Timeline]: () => Timeline;
    [TYPES.TimelineLike]: () => Timeline;
    abstract [TYPES.TexMap]: () => Map<string, Texchange<H>>;
    [TYPES.UserTexes]: () => UserTex<H>[];
    [TYPES.Context]: () => Context<H>;
    abstract [TYPES.StrategyLike]: () => StrategyLike;
    [TYPES.Tecretary]: () => Tecretary<H>;
}
