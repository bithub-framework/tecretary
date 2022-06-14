import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { TimelineLike } from 'secretary-like';
export declare class Timeline extends TimeEngine implements TimelineLike {
    private lock;
    private poller;
    startable: import("startable/build/startable").Startable;
    constructor(time: number, pollerEngine: TimeEngineLike);
    private start;
    private stop;
    private loop;
    sleep(ms: number): Cancellable;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
