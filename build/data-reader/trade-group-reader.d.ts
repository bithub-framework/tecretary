import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminFacade } from 'texchange/build/facades.d/admin';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private H;
    constructor(db: Database.Database, H: HStatic<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, adminTex: AdminFacade<H>, afterTradeId: number): Iterable<DatabaseTrade<H>[]>;
    getDatabaseTradeGroupsAfterTime(marketName: string, adminTex: AdminFacade<H>, afterTime: number): Iterable<DatabaseTrade<H>[]>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
