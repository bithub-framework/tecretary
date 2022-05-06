import { Startable } from 'startable';
import { Texchange } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic, StrategyStatic } from 'secretary-like';
export declare class Tecretary<H extends HLike<H>> {
    private progressReader;
    private dataReader;
    private strategy;
    private timeline;
    private adminTexMap;
    startable: Startable;
    constructor(Strategy: StrategyStatic<H>, config: Config, texMap: Map<string, Texchange<H, any>>, H: HStatic<H>);
    private start;
    private stop;
}
