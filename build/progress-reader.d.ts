import { Config } from './config';
import { Models } from 'texchange/build/texchange/models';
import { AdminFacade } from 'texchange/build/facades.d/admin';
export declare class ProgressReader {
    private config;
    private startTime;
    private db;
    startable: import("startable/build/startable").Startable;
    constructor(config: Config, filePath: string, startTime: number);
    capture(time: number, adminTexMap: Map<string, AdminFacade<any>>): void;
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
