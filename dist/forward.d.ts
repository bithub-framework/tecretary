import { SortedQueueItem as HeapItem } from 'sorted-queue';
interface Item {
    time: number;
    cb: () => void;
}
declare class Forward {
    now: number;
    private heap;
    constructor(now: number);
    next(): void;
    get nextTime(): number | undefined;
    setTimeout: (cb: () => void, ms: number) => HeapItem<Item>;
    clearTimeout: (timeout: HeapItem<Item>) => void;
    sleep: (ms: number) => Promise<void>;
}
export { Forward as default, Forward, HeapItem as Timeout, };
