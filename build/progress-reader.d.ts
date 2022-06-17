import { Config } from './config';
import { Models } from 'texchange/build/texchange/models';
import { Texchange } from 'texchange/build/texchange/texchange';
import { HLike } from 'secretary-like';
export declare class ProgressReader<H extends HLike<H>> {
    private config;
    private startTime;
    private db;
    startable: import("startable/build/startable").Startable;
    constructor(config: Config, filePath: string, startTime: number);
    capture(time: number, texchangeMap: Map<string, Texchange<H>>): void;
    private lock;
    private unlock;
    getTime(): number;
    private setTime;
    getSnapshot(marketName: string): Models.Snapshot | null;
    private setSnapshot;
    log(content: string, time: number): void;
    private start;
    private stop;
}
