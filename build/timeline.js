"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
const coroutine_locks_1 = require("coroutine-locks");
const time_engine_1 = require("./time-engine");
const cancellable_1 = require("cancellable");
class Timeline {
    constructor(currentTime, sortedInitialCheckPoints) {
        this.lock = new coroutine_locks_1.Rwlock();
        this.engine = new time_engine_1.TimeEngine(currentTime, sortedInitialCheckPoints);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    async next() {
        await this.lock.wrlock();
        try {
            const r = this.engine.next();
            if (r.done)
                return { done: true, value: void null };
            const cb = r.value;
            cb();
            return { done: false, value: void null };
        }
        finally {
            this.lock.unlock();
        }
    }
    now() {
        return this.engine.now();
    }
    sleep(ms) {
        return new cancellable_1.Cancellable(ms, this.engine);
    }
    async escape(p) {
        await this.lock.rdlock();
        try {
            return await p;
        }
        finally {
            this.lock.unlock();
        }
    }
}
exports.Timeline = Timeline;
//# sourceMappingURL=timeline.js.map