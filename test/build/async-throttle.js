"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncThrottle = void 0;
function asyncThrottle(f, interval) {
    let lastTime = Number.NEGATIVE_INFINITY;
    let running = null;
    return (async (...args) => {
        if (Date.now() < lastTime + interval)
            return;
        if (running !== null)
            return running;
        return running = f();
    });
}
exports.asyncThrottle = asyncThrottle;
//# sourceMappingURL=async-throttle.js.map