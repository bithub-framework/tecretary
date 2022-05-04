"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    constructor(time, wait, cb) {
        this.time = time;
        this.wait = wait;
        this.cb = cb;
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