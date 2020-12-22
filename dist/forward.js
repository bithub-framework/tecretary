import { SortedQueue as Heap, SortedQueueItem as HeapItem, } from 'sorted-queue';
class Forward {
    constructor(currentTime) {
        this.currentTime = currentTime;
        this.heap = new Heap((a, b) => a.time - b.time);
        this.now = () => this.currentTime;
        this.setTimeout = (cb, ms) => this.heap.push({
            time: this.currentTime + ms,
            cb,
        });
        this.clearTimeout = (timeout) => {
            timeout.pop();
        };
        this.sleep = (ms) => new Promise(resolve => void this.setTimeout(resolve, ms));
    }
    next() {
        if (!this.heap.peek())
            throw new Error('Empty');
        const item = this.heap.pop().value;
        this.currentTime = item.time;
        // in case cb() calls next() syncly
        setImmediate(item.cb);
    }
    getNextTime() {
        const peek = this.heap.peek();
        return peek ? peek.value.time : Number.POSITIVE_INFINITY;
    }
}
export { Forward as default, Forward, HeapItem as Timeout, };
//# sourceMappingURL=forward.js.map