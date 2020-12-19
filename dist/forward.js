import { SortedQueue as Heap, SortedQueueItem as HeapItem, } from 'sorted-queue';
class Forward {
    constructor(now) {
        this.now = now;
        this.heap = new Heap((a, b) => a.time - b.time);
        this.setTimeout = (cb, ms) => this.heap.push({
            time: this.now + ms,
            cb,
        });
        this.clearTimeout = (timeout) => {
            timeout.pop();
        };
        this.sleep = (ms) => new Promise(resolve => void this.setTimeout(resolve, ms));
    }
    next() {
        if (this.heap.peek() === undefined)
            throw new Error('Empty');
        const item = this.heap.pop().value;
        this.now = item.time;
        // in case cb() calls next() syncly
        setImmediate(item.cb);
    }
    get nextTime() {
        const peek = this.heap.peek();
        return peek?.value.time;
    }
}
export { Forward as default, Forward, HeapItem as Timeout, };
//# sourceMappingURL=forward.js.map