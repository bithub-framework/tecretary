import { TimeEngineLike, TimeoutLike } from 'time-engine-like';
export interface CheckPoint {
    time: number;
    cb: () => void;
}
export declare class TimeEngine implements TimeEngineLike, IterableIterator<() => void> {
    private time;
    private sortque;
    constructor(time: number);
    pushSortedCheckPoints(sorted: Iterator<CheckPoint>): void;
    setTimeout(cb: () => void, ms: number): TimeoutLike;
    [Symbol.iterator](): this;
    next(): IteratorResult<() => void, void>;
    now(): number;
}
