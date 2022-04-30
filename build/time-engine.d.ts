import { TimeEngineLike, TimeoutLike, Callback } from 'cancellable';
export { Callback };
export interface CheckPoint {
    time: number;
    cb: Callback;
}
export declare class TimeEngine implements TimeEngineLike, IterableIterator<Callback> {
    time: number;
    private sortque;
    constructor(time: number, sortedInitialCheckPoints?: Iterator<CheckPoint>);
    setTimeout(cb: Callback, ms: number): TimeoutLike;
    [Symbol.iterator](): this;
    next(): IteratorResult<Callback>;
    now(): number;
}
export { TimeoutLike };
