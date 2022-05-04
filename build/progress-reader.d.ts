import { Config } from './config';
import { Snapshot } from 'texchange/build/models';
import { Startable } from 'startable';
import { AdminTex } from 'texchange/build/texchange';
export declare class ProgressReader {
    private config;
    private db;
    startable: Startable;
    constructor(config: Config);
    capture(time: number, adminTexMap: Map<string, AdminTex<any, any>>): void;
    private lock;
    private unlock;
    getTime(): number;
    private setTime;
    getSnapshot<PricingSnapshot>(marketName: string): Snapshot<PricingSnapshot> | null;
    private setSnapshot;
    private start;
    private stop;
}
