import Database = require('better-sqlite3');
import { HFactory, HLike } from 'secretary-like';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { Texchange } from 'texchange/build/texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, texchange: Texchange<H>, afterTradeId: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, texchange: Texchange<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
