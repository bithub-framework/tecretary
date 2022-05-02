import { Config } from './config';
import { Snapshot } from 'texchange/build/models';
import { Startable } from 'startable';
export declare class ProgressReader {
    private config;
    private projectId;
    private time;
    private db;
    startable: Startable;
    constructor(config: Config);
    getTime(): number;
    getSnapshot<PricingSnapshot>(marketName: string): Snapshot<PricingSnapshot> | null;
    setSnapshot<PricingSnapshot>(marketName: string, snapshot: Snapshot<PricingSnapshot>): void;
    private start;
    private stop;
}
