import Database = require('better-sqlite3');
import { HFactory, HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseOrderbook } from 'texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseOrderbooksAfterId(marketName: string, marketSpec: MarketSpecLike<H>, afterOrderbookId: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
