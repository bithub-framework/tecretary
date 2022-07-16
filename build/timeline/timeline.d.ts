import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { TimelineLike } from 'secretary-like';
import { StartableLike } from 'startable';
export declare class Timeline extends TimeEngine implements TimelineLike, StartableLike {
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => import("startable").ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    private lock;
    private poller;
    constructor(startTime: number, pollerEngine: TimeEngineLike);
    private rawStart;
    private rawStop;
    private loop;
    sleep(ms: number): Cancellable;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
