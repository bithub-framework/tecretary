import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { TimelineLike } from 'secretary-like';
export declare class Timeline extends TimeEngine implements TimelineLike {
    $s: import("startable").Startable<[]>;
    private lock;
    private poller;
    constructor(startTime: number, pollerEngine: TimeEngineLike);
    private rawStart;
    private rawStop;
    private loop;
    sleep(ms: number): Cancellable;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
