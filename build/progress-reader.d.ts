import { Config } from './config';
import { Models } from 'texchange/build/models';
import { Startable } from 'startable';
import { AdminTex } from 'texchange/build/texchange';
export declare class ProgressReader {
    private config;
    private db;
    startable: Startable;
    constructor(config: Config);
    capture(time: number, adminTexMap: Map<string, AdminTex<any>>): void;
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
