import Startable from 'startable';
import { Orderbook, Config } from './interfaces';
declare class AsyncForwardIterator<T> implements AsyncIterator<T> {
    private i;
    current?: T;
    constructor(i: AsyncIterator<T>);
    next(): Promise<IteratorResult<T, any>>;
}
declare class DbReader extends Startable {
    private config;
    private db;
    constructor(config: Config);
    private getTradesIterator;
    getTrades(): AsyncForwardIterator<Pick<import("interfaces/dist/data").Trade, "side" | "price" | "quantity" | "time">>;
    private getOrderbooksIterator;
    getOrderbooks(): AsyncForwardIterator<Orderbook>;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    getMinTime(): Promise<number>;
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
