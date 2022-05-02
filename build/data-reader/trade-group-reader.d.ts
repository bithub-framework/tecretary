import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private adminTexMap;
    private H;
    constructor(db: Database.Database, adminTexMap: Map<string, AdminTex<H, unknown>>, H: HStatic<H>);
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTrades;
    private getRawTradesAfterTradeId;
}
