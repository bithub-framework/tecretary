import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private H;
    private adminTexMap;
    constructor(db: Database.Database, H: HStatic<H>, adminTexMap: Map<string, AdminTex<H>>);
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTrades;
    private getRawTradesAfterTradeId;
}
