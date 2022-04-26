import { Timeline } from 'interfaces';
import { Rwlock } from 'coroutine-locks';
import { TimeEngine } from './time-engine';
import { Cancellable } from './cancellable';
import assert = require('assert');



export class Forward implements Timeline {
    private engine: TimeEngine;
    private lock = new Rwlock();

    constructor(private currentTime: number) {
        this.engine = new TimeEngine(currentTime);
    }

    public async next(): Promise<void> {
        await this.lock.wrlock();

        const r = this.engine.next();
        assert(!r.done);
        const cb = r.value;
        cb();

        this.lock.unlock();
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
