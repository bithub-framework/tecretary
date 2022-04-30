import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { AdminTex } from 'texchange/build/texchange';
export declare class OrderbookReader<H extends HLike<H>> {
    private db;
    private H;
    private adminTexMap;
    constructor(db: Database.Database, H: HStatic<H>, adminTexMap: Map<string, AdminTex<H>>);
    getDatabaseOrderbooks(marketName: string, afterOrderbookId?: number): IterableIterator<DatabaseOrderbook<H>>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrders;
    private getRawBookOrdersAfterOrderbookId;
}
