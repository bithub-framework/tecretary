import Database = require('better-sqlite3');
import { HLike, MarketSpecLike } from 'secretary-like';
import { DatabaseTradeLike, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private DataTypes;
    constructor(db: Database.Database, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpecLike<H>, afterTradeId: number, endTime: number): Generator<DatabaseTradeLike<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpecLike<H>, afterTime: number, endTime: number): Generator<DatabaseTradeLike<H>[], void>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
