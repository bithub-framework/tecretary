import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { AdminTex } from 'texchange/build/texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private H;
    constructor(db: Database.Database, H: HStatic<H>);
    getDatabaseOrderbooksAfterId(marketName: string, adminTex: AdminTex<H>, afterOrderbookId: number): Iterable<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, adminTex: AdminTex<H>, afterTime: number): Iterable<DatabaseOrderbook<H>>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
