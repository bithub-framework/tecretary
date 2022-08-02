"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    constructor(interval, engine) {
        this.interval = interval;
        this.engine = engine;
        this.lastTime = Number.NEGATIVE_INFINITY;
    }
    invoke(f) {
        return async (...args) => {
            const time = this.lastTime + this.interval - this.engine.now();
            if (time > 0)
                await this.engine.sleep(time);
            this.lastTime = this.engine.now();
            return await f(...args);
        };
    }
}
exports.Throttle = Throttle;
//# sourceMappingURL=throttle.js.map