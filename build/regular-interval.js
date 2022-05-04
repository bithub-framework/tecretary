"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regularInverval = void 0;
function* regularInverval(startTime, wait, cb) {
    for (let time = startTime;; time += wait)
        yield {
            cb,
            time,
        };
}
exports.regularInverval = regularInverval;
//# sourceMappingURL=regular-interval.js.map