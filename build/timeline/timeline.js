"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
const coroutine_locks_1 = require("@zimtsui/coroutine-locks");
const time_engine_1 = require("./time-engine");
const cancellable_1 = require("cancellable");
const pollerloop_1 = require("pollerloop");
const startable_1 = require("startable");
class Timeline extends time_engine_1.TimeEngine {
    constructor(startTime, pollerEngine) {
        super(startTime);
        this.startable = startable_1.Startable.create(() => this.rawStart(), () => this.rawStop());
        this.start = this.startable.start;
        this.stop = this.startable.stop;
        this.assart = this.startable.assart;
        this.starp = this.startable.starp;
        this.getReadyState = this.startable.getReadyState;
        this.skipStart = this.startable.skipStart;
        this.lock = new coroutine_locks_1.Rwlock();
        this.poller = new pollerloop_1.Pollerloop(sleep => this.loop(sleep), pollerEngine);
    }
    async rawStart() {
        await this.poller.start(this.startable.starp);
    }
    async rawStop() {
        const p = this.poller.stop();
        this.lock.throw(new pollerloop_1.LoopStopped('Loop stopped.'));
        await p;
    }
    async loop(sleep) {
        await this.lock.wrlock();
        await sleep(0);
        for (const cb of this) {
            cb();
            this.lock.unlock();
            await this.lock.wrlock();
            await sleep(0);
        }
    }
    sleep(ms) {
        return new cancellable_1.Cancellable(ms, this);
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