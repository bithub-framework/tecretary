import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { TimelineLike } from 'secretary-like';
import { Startable } from 'startable';
export declare class Timeline extends TimeEngine implements TimelineLike {
    private lock;
    private poller;
    startable: Startable;
    constructor(startTime: number, pollerEngine: TimeEngineLike);
    private start;
    private stop;
    private loop;
    sleep(ms: number): Cancellable;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
