import { TimelineLike } from 'interfaces';
import { CheckPoint } from './time-engine';
export declare class Timeline implements TimelineLike, AsyncIterableIterator<void> {
    private engine;
    private lock;
    constructor(currentTime: number, sortedInitialCheckPoints: Iterator<CheckPoint>);
    [Symbol.asyncIterator](): this;
    next(): Promise<IteratorResult<void, void>>;
    now(): number;
    sleep(ms: number): Promise<void>;
    escape<T>(p: PromiseLike<T>): Promise<T>;
}
