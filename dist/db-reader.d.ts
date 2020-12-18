import Startable from 'startable';
import { Orderbook, RawTrade } from './interfaces';
declare class AsyncForwardIterator<T> implements AsyncIterator<T> {
    private i;
    current?: T;
    constructor(i: AsyncIterator<T>);
    next(): Promise<IteratorResult<T, any>>;
}
declare class DbReader extends Startable {
    private db;
    constructor(filePath: string);
    private getTradesIterator;
    getTrades(): AsyncForwardIterator<RawTrade>;
    private getOrderbooksIterator;
    getOrderbooks(): AsyncForwardIterator<Orderbook>;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    getMinTime(): Promise<number>;
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
