import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { AdminTex } from 'texchange/build/texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private adminTexMap;
    private H;
    constructor(db: Database.Database, adminTexMap: Map<string, AdminTex<H, unknown>>, H: HStatic<H>);
    getDatabaseOrderbooksAfterOrderbookId(marketName: string, afterOrderbookId: number): IterableIterator<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, afterTime: number): IterableIterator<DatabaseOrderbook<H>>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrdersAfterTime;
    private getRawBookOrdersAfterOrderbookId;
}
