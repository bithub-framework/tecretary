import { HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseOrderbookLike, DatabaseOrderbookId, DatabaseTradeLike, DatabaseTradeId, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
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
    constructor(filePath: string, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpecLike<H>, id: DatabaseOrderbookId, endTime: number): Generator<DatabaseOrderbookLike<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbookLike<H>, void>;
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpecLike<H>, id: DatabaseTradeId, endTime: number): Generator<DatabaseTradeLike<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseTradeLike<H>[], void>;
    private rawStart;
    private rawStop;
}
