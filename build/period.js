"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Period = void 0;
const startable_1 = require("startable");
class Period {
    constructor(timeline, ms, cb) {
        this.timeline = timeline;
        this.ms = ms;
        this.cb = cb;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.onTimeout = () => {
            this.cb();
            if (this.startable.getReadyState() === "STARTED" /* STARTED */)
                this.timeline.sleep(this.ms).then(this.onTimeout);
        };
    }
    async start() {
        this.timeline.sleep(this.ms).then(this.onTimeout);
    }
    async stop() { }
}
exports.Period = Period;
//# sourceMappingURL=period.js.map