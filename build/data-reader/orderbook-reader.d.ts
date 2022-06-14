import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { AdminFacade } from 'texchange/build/facades.d/admin';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private H;
    constructor(db: Database.Database, H: HStatic<H>);
    getDatabaseOrderbooksAfterId(marketName: string, adminTex: AdminFacade<H>, afterOrderbookId: number): Iterable<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, adminTex: AdminFacade<H>, afterTime: number): Iterable<DatabaseOrderbook<H>>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
