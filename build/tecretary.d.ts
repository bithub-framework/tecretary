import { Startable } from 'startable';
import { Texchange } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic } from 'interfaces';
import { StrategyStatic } from 'interfaces/build/secretaries/strategy-like';
export declare class Tecretary<H extends HLike<H>> {
    private config;
    private progressReader;
    private dataReader;
    private strategy;
    private timeline;
    private adminTexMap;
    private dataCheckPoints;
    private pollerloop;
    private lastSnapshotTime;
    startable: Startable;
    constructor(Strategy: StrategyStatic<H>, config: Config, texMap: Map<string, Texchange<H, unknown>>, H: HStatic<H>);
    private start;
    private stop;
    private loop;
    private tryCapture;
}
