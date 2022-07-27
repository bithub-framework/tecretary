"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEngine = exports.Timeout = void 0;
const binary_heap_1 = require("@zimtsui/binary-heap");
const shiftable_1 = require("shiftable");
const assert = require("assert");
const cmp_1 = require("./cmp");
class Timeout {
    constructor(node) {
        this.node = node;
    }
    clear() {
        this.node.remove();
    }
}
exports.Timeout = Timeout;
class TimeEngine {
    constructor(time) {
        this.time = time;
        this.heap = new binary_heap_1.Heap(cmp_1.cmp);
        this.checkPoints = this.heap;
        this.sorted = true;
    }
    merge(sorted) {
        assert(this.sorted);
        this.checkPoints = new shiftable_1.Merged(cmp_1.cmp, this.checkPoints, sorted);
    }
    affiliate(sorted) {
        assert(this.sorted);
        this.checkPoints = new shiftable_1.Affiliation(cmp_1.cmp, this.checkPoints, sorted);
    }
    setTimeout(cb, ms) {
        const checkPoint = {
            time: this.time + ms,
            cb,
        };
        const pointer = this.heap.push(checkPoint);
        return new Timeout(pointer);
    }
    *[Symbol.iterator]() {
        try {
            for (;;) {
                const checkPoint = this.checkPoints.shift();
                this.time = checkPoint.time;
                yield checkPoint.cb;
            }
        }
        catch (err) {
            assert(err instanceof RangeError);
        }
    }
    now() {
        return this.time;
    }
}
exports.TimeEngine = TimeEngine;
//# sourceMappingURL=time-engine.js.map