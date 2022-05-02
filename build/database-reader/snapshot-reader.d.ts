import Database = require('better-sqlite3');
import { Config } from '../config';
import { Snapshot } from 'texchange/build/texchange';
export declare class SnapshotReader {
    private db;
    private config;
    private projectId;
    constructor(db: Database.Database, config: Config);
    getSnapshot<PricingSnapshot>(marketName: string): Snapshot<PricingSnapshot> | null;
    setSnapshot<PricingSnapshot>(marketName: string, snapshot: Snapshot<PricingSnapshot>): void;
}
