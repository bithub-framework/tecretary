import { CheckPoint } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { TimelineLike } from 'secretary-like';
import { Startable } from 'startable';
export declare class Timeline implements TimelineLike {
    private prehook;
    private posthook;
    private engine;
    private lock;
    private poller;
    startable: Startable;
    constructor(startTime: number, sortedInitialCheckPoints: Iterator<CheckPoint>, pollerEngine: TimeEngineLike, prehook?: () => void, posthook?: () => void);
    private start;
    private stop;
    private loop;
    now(): number;
    sleep(ms: number): Cancellable;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
