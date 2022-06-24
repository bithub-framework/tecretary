import { Config } from './config';
import { Snapshot } from 'texchange/build/facades.d/admin';
import { StartableLike } from 'startable';
import { Texchange } from 'texchange/build/texchange';
import { HLike } from 'secretary-like';
export declare class ProgressReader<H extends HLike<H>> implements StartableLike {
    private config;
    private startTime;
    private db;
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => import("startable").ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    constructor(config: Config, filePath: string, startTime: number);
    capture(time: number, texchangeMap: Map<string, Texchange<H>>): void;
    private lock;
    private unlock;
    getTime(): number;
    private setTime;
    getSnapshot(marketName: string): Snapshot | null;
    private setSnapshot;
    log(content: string, time: number): void;
    private rawStart;
    private RawStop;
}
