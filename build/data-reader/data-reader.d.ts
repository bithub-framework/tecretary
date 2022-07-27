import { HFactory, HLike, MarketSpec } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
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
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpec<H>, id: DatabaseOrderbookId, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpec<H>, id: DatabaseTradeId, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private rawStart;
    private rawStop;
}
