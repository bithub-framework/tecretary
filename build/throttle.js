"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    constructor(wait, cb) {
        this.wait = wait;
        this.cb = cb;
        this.time = Number.NEGATIVE_INFINITY;
    }
    call(now) {
        if (now >= this.time + this.wait) {
            this.time = now;
            this.cb();
        }
    }
}
exports.Throttle = Throttle;
//# sourceMappingURL=throttle.js.map