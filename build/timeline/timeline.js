"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
const coroutine_locks_1 = require("coroutine-locks");
const time_engine_1 = require("./time-engine");
const cancellable_1 = require("cancellable");
const pollerloop_1 = require("pollerloop");
const startable_1 = require("startable");
class Timeline {
    constructor(startTime, pollerEngine, prehook = () => { }, posthook = () => { }) {
        this.prehook = prehook;
        this.posthook = posthook;
        this.lock = new coroutine_locks_1.Rwlock();
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.engine = new time_engine_1.TimeEngine(startTime);
        this.poller = new pollerloop_1.Pollerloop(sleep => this.loop(sleep), pollerEngine);
    }
    async start() {
        await this.poller.startable.start(this.startable.starp);
    }
    async stop() {
        const p = this.poller.startable.stop();
        this.lock.throw(new pollerloop_1.LoopStopped('Loop stopped.'));
        await p;
    }
    pushSortedCheckPoints(sorted) {
        this.engine.pushSortedCheckPoints(sorted);
    }
    async loop(sleep) {
        await this.lock.wrlock();
        await sleep(0);
        for (const cb of this.engine) {
            this.prehook();
            cb();
            this.lock.unlock();
            await this.lock.wrlock();
            await sleep(0);
            this.posthook();
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