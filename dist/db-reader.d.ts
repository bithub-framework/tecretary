import Startable from 'startable';
import { Trade, Orderbook } from './interfaces';
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
    getTrades(): AsyncForwardIterator<Trade>;
    private getOrderbookIterator;
    getOrderbook(): AsyncForwardIterator<Orderbook>;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { DbReader as default, DbReader, };
