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
    constructor(public now: number) { }

    public next() {
        if (this.heap.peek() === undefined) throw new Error('Empty');
        const item = this.heap.pop()!.value;
        this.now = item.time;
        // in case cb() calls next() syncly
        setImmediate(item.cb);
    }

    public get nextTime(): number | undefined {
        const peek = this.heap.peek();
        return peek?.value.time;
    }

    public setTimeout = (cb: () => void, ms: number): HeapItem<Item> =>
        this.heap.push({
            time: this.now + ms,
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
