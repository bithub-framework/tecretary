import { Startable } from 'startable';
import { Texchange } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic } from 'interfaces';
import { StrategyStatic } from 'interfaces/build/secretaries/strategy-like';
export declare class Tecretary<H extends HLike<H>> {
    private H;
    private reader;
    private strategy;
    private timeline;
    private context;
    private adminTexMap;
    private userTexes;
    private dataCheckPoints;
    private pollerloop;
    startable: Startable;
    constructor(Strategy: StrategyStatic<H>, config: Config, texMap: Map<string, Texchange<H, unknown>>, H: HStatic<H>);
    private start;
    private stop;
    private loop;
}
