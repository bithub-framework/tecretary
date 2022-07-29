import Database = require('better-sqlite3');
import { HFactory, HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseTrade } from 'texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private hFactory;
    constructor(db: Database.Database, hFactory: HFactory<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpecLike<H>, afterTradeId: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
