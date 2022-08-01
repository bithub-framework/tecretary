import { HLike, MarketSpec } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId, DatabaseTrade, DatabaseTradeId, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
import { DataReaderLike } from '../data-reader-like';
export declare class DataReader<H extends HLike<H>> implements DataReaderLike<H> {
    private db;
    private orderbookReader;
    private tradeGroupReader;
    $s: import("startable").Startable<[]>;
    constructor(filePath: string, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpec<H>, id: DatabaseOrderbookId, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpec<H>, id: DatabaseTradeId, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private rawStart;
    private rawStop;
}
