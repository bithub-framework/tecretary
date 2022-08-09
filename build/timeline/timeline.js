"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeline = void 0;
const coroutine_locks_1 = require("@zimtsui/coroutine-locks");
const time_engine_1 = require("./time-engine");
const pollerloop_1 = require("pollerloop");
const startable_1 = require("startable");
class Timeline extends time_engine_1.TimeEngine {
    constructor(startTime, pollerEngine) {
        super(startTime);
        this.$s = (0, startable_1.createStartable)(() => this.rawStart(), () => this.rawStop());
        this.lock = new coroutine_locks_1.Rwlock();
        this.poller = new pollerloop_1.Pollerloop(sleep => this.loop(sleep), pollerEngine);
    }
    async rawStart() {
        await this.poller.$s.start(this.$s.starp);
    }
    async rawStop() {
        const p = this.poller.$s.stop();
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