"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
const coroutine_locks_1 = require("@zimtsui/coroutine-locks");
const time_engine_1 = require("./time-engine");
const cancellable_1 = require("cancellable");
const pollerloop_1 = require("pollerloop");
const startable_1 = require("startable");
class Timeline extends time_engine_1.TimeEngine {
    constructor(time, pollerEngine) {
        super(time);
        this.lock = new coroutine_locks_1.Rwlock();
        this.startable = startable_1.Startable.create(() => this.start(), () => this.stop());
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