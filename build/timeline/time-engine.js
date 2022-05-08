"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEngine = void 0;
const sortque_1 = require("sortque");
const assert = require("assert");
class Timeout {
    constructor(pointer) {
        this.pointer = pointer;
    }
    clear() {
        this.pointer.remove();
    }
}
class TimeEngine {
    constructor(time) {
        this.time = time;
        this.sortque = new sortque_1.Sortque((x1, x2) => x1.time < x2.time);
    }
    pushSortedCheckPoints(sorted) {
        this.sortque.pushSorted(sorted);
        try {
            assert(this.sortque.getFront().time >= this.time);
        }
        catch (err) {
            assert(err instanceof sortque_1.NoEnoughElem);
        }
    }
    setTimeout(cb, ms) {
        const pointer = this.sortque.push({
            time: this.time + ms,
            cb,
        });
        return new Timeout(pointer);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        try {
            const checkPoint = this.sortque.shift();
            this.time = checkPoint.time;
            return {
                done: false,
                value: checkPoint.cb,
            };
        }
        catch (err) {
            return {
                done: true,
                value: void null,
            };
        }
    }
    now() {
        return this.time;
    }
}
exports.TimeEngine = TimeEngine;
//# sourceMappingURL=time-engine.js.map