import Database = require('better-sqlite3');
import { HFactory, HLike } from 'secretary-like';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { Texchange } from 'texchange/build/texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseOrderbooksAfterId(marketName: string, texchange: Texchange<H>, afterOrderbookId: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, texchange: Texchange<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
