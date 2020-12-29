import { SortedQueue as Heap, SortedQueueItem as HeapItem, } from 'sorted-queue';
import assert from 'assert';
class Forward {
    constructor(currentTime) {
        this.currentTime = currentTime;
        this.heap = new Heap((a, b) => a.time - b.time);
        this.lock = new Lock();
        this.now = () => this.currentTime;
        this.setTimeout = (cb, ms) => {
            assert(ms >= 0);
            return this.heap.push({
                time: this.currentTime + ms,
                cb,
            });
        };
        this.clearTimeout = (timeout) => {
            timeout.pop();
        };
        this.sleep = (ms) => new Promise(resolve => void this.setTimeout(resolve, ms));
        this.escape = async (v) => {
            this.lock.lock();
            const r = await v;
            this.lock.unlock();
            return r;
        };
    }
    async next() {
        await this.lock.isUnlocked;
        if (!this.heap.peek())
            throw new Error('Empty');
        const item = this.heap.pop().value;
        this.currentTime = item.time;
        item.cb();
    }
    getNextTime() {
        const peek = this.heap.peek();
        return peek ? peek.value.time : Number.POSITIVE_INFINITY;
    }
}
class Lock {
    constructor() {
        this.count = 0;
        this.isUnlocked = Promise.resolve();
    }
    lock() {
        if (!this.count++)
            this.isUnlocked = new Promise(resolve => {
                this.resolve = resolve;
            });
    }
    unlock() {
        assert(this.count > 0);
        if (!--this.count)
            this.resolve();
    }
}
export { Forward as default, Forward, HeapItem as Timeout, };
//# sourceMappingURL=forward.js.map