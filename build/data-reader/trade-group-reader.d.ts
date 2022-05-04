import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private H;
    constructor(db: Database.Database, H: HStatic<H>);
    getDatabaseTradeGroupsAfterTradeId(marketName: string, adminTex: AdminTex<H, unknown>, afterTradeId: number): IterableIterator<DatabaseTrade<H>[]>;
    getDatabaseTradeGroupsAfterTime(marketName: string, adminTex: AdminTex<H, unknown>, afterTime: number): IterableIterator<DatabaseTrade<H>[]>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
