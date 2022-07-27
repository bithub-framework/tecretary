import Database = require('better-sqlite3');
import { HFactory, HLike, MarketSpec } from 'secretary-like';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpec<H>, afterTradeId: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
