import { Config } from './config';
import { Snapshot } from 'texchange';
import { Texchange } from 'texchange';
import { HLike } from 'secretary-like';
import { ProgressReaderLike } from './progress-reader-like';
export declare class ProgressReader<H extends HLike<H>> implements ProgressReaderLike<H> {
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
    getTime(): number;
    private setTime;
    getSnapshot(marketName: string): Snapshot | null;
    private setSnapshot;
    log(content: string, time: number): void;
    private clear;
    private rawStart;
    private rawStop;
}
