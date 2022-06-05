"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePeriodicCheckPoints = void 0;
function* makePeriodicCheckPoints(startTime, period, cb) {
    for (let time = startTime;; time += period)
        yield {
            time,
            cb,
        };
}
exports.makePeriodicCheckPoints = makePeriodicCheckPoints;
//# sourceMappingURL=periodic.js.map