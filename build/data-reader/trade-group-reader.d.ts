import Database = require('better-sqlite3');
import { HLike, MarketSpec } from 'secretary-like';
import { DatabaseTrade, DataTypesNamespace as TexchangeDataTypesNamespace } from 'texchange';
export declare class TradeGroupReader<H extends HLike<H>> {
    private db;
    private DataTypes;
    constructor(db: Database.Database, DataTypes: TexchangeDataTypesNamespace<H>);
    getDatabaseTradeGroupsAfterId(marketName: string, marketSpec: MarketSpec<H>, afterTradeId: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, marketSpec: MarketSpec<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTradesAfterTime;
    private getRawTradesAfterTradeId;
}
