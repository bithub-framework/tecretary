import Database = require('better-sqlite3');
import { HFactory, HLike, MarketSpec } from 'secretary-like';
import { DatabaseOrderbook } from 'texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpec<H>, afterOrderbookId: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
