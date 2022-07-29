import { HFactory, HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId, DatabaseTrade, DatabaseTradeId } from 'texchange';
import { DataReaderLike } from '../data-reader-like';
export declare class DataReader<H extends HLike<H>> implements DataReaderLike<H> {
    private db;
    private orderbookReader;
    private tradeGroupReader;
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => import("startable").ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    constructor(filePath: string, hFactory: HFactory<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpecLike<H>, id: DatabaseOrderbookId, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpecLike<H>, id: DatabaseTradeId, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private rawStart;
    private rawStop;
}
