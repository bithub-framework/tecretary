import { TimeEngineLike, TimeoutLike } from 'time-engine-like';
import { PointerLike } from '@zimtsui/binary-heap';
import { Shiftable } from 'shiftable';
import { CheckPoint } from './check-point';
export declare class Timeout implements TimeoutLike {
    private pointer;
    constructor(pointer: PointerLike<CheckPoint>);
    clear(): void;
}
export declare class TimeEngine implements TimeEngineLike, Iterable<() => void> {
    private time;
    private heap;
    private checkPoints;
    constructor(time: number);
    merge(sorted: Shiftable<CheckPoint>): void;
    affiliate(sorted: Shiftable<CheckPoint>): void;
    setTimeout(cb: () => void, ms: number): TimeoutLike;
    [Symbol.iterator](): Generator<() => void, void, unknown>;
    now(): number;
}
