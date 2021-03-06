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
    getTrades(after?: number): AsyncForwardIterator<Pick<import("interfaces/dist/data").Trade, "side" | "price" | "quantity" | "time">>;
    private getOrderbooksIterator;
    getOrderbooks(after?: number): AsyncForwardIterator<Orderbook>;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    getMinTime(): Promise<number>;
    private validateTables;
    private validateOrderbook;
    private dbOrderbook2Orderbook;
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
