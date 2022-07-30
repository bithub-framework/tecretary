import Database = require('better-sqlite3');
import { HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseOrderbookLike, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private DataTypes;
    constructor(db: Database.Database, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpecLike<H>, afterOrderbookId: number, endTime: number): Generator<DatabaseOrderbookLike<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbookLike<H>, void>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
