import Database = require('better-sqlite3');
import { HLike, MarketSpec } from 'secretary-like';
import { DatabaseOrderbook, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private DataTypes;
    constructor(db: Database.Database, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpec<H>, afterOrderbookId: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
