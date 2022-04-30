import { TimelineLike } from 'interfaces';
import { Rwlock } from 'coroutine-locks';
import { TimeEngine, CheckPoint } from './time-engine';
import {
    Cancellable,
} from 'cancellable';



export class Timeline implements TimelineLike, AsyncIterableIterator<void> {
    private engine: TimeEngine;
    private lock = new Rwlock();

    public constructor(
        currentTime: number,
        sortedInitialCheckPoints: Iterator<CheckPoint>,
    ) {
        this.engine = new TimeEngine(
            currentTime,
            sortedInitialCheckPoints,
        );
    }

    public [Symbol.asyncIterator]() {
        return this;
    }

    public async next(): Promise<IteratorResult<void, void>> {
        await this.lock.wrlock();
        try {
            const r = this.engine.next();
            if (r.done) return { done: true, value: void null };
            const cb = r.value;
            cb();
            return { done: false, value: void null };
        } finally {
            this.lock.unlock();
        }
    }

    public now(): number {
        return this.engine.now();
    }

    public sleep(ms: number): Promise<void> {
        return new Cancellable(
            ms,
            this.engine,
        );
    }

    public async escape<T>(p: PromiseLike<T>): Promise<T> {
        await this.lock.rdlock();
        try {
            return await p;
        } finally {
            this.lock.unlock();
        }
    }
}
