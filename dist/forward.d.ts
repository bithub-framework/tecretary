import { SortedQueueItem as HeapItem } from 'sorted-queue';
interface Item {
    time: number;
    cb: () => void;
}
declare class Forward {
    private currentTime;
    private heap;
    constructor(currentTime: number);
    next(): void;
    now: () => number;
    getNextTime(): number;
    setTimeout: (cb: () => void, ms: number) => HeapItem<Item>;
    clearTimeout: (timeout: HeapItem<Item>) => void;
    sleep: (ms: number) => Promise<void>;
}
export { Forward as default, Forward, HeapItem as Timeout, };
