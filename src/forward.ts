import {
    SortedQueue as Heap,
    SortedQueueItem as HeapItem,
} from 'sorted-queue';

interface Item {
    time: number;
    cb: () => void;
}

class Forward {
    private heap = new Heap<Item>((a, b) => a.time - b.time);
    constructor(private currentTime: number) { }

    public next() {
        if (!this.heap.peek()) throw new Error('Empty');
        const item = this.heap.pop()!.value;
        this.currentTime = item.time;
        // in case cb() calls next() syncly
        setImmediate(item.cb);
    }

    public now = () => this.currentTime;

    public getNextTime(): number {
        const peek = this.heap.peek();
        return peek ? peek.value.time : Number.POSITIVE_INFINITY;
    }

    public setTimeout = (cb: () => void, ms: number): HeapItem<Item> =>
        this.heap.push({
            time: this.currentTime + ms,
            cb,
        });

    public clearTimeout = (timeout: HeapItem<Item>): void => {
        timeout.pop();
    }

    public sleep = (ms: number): Promise<void> =>
        new Promise<void>(resolve => void this.setTimeout(resolve, ms));
}

export {
    Forward as default,
    Forward,
    HeapItem as Timeout,
}
