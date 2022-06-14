import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { AdminFacade } from 'texchange/build/facades.d/admin';
export declare class DataReader<H extends HLike<H>> {
    private db;
    startable: import("startable/build/startable").Startable;
    private orderbookReader;
    private tradeGroupReader;
    constructor(filePath: string, H: HStatic<H>);
    getDatabaseOrderbooksAfterId(marketName: string, adminTex: AdminFacade<H>, id: DatabaseOrderbookId): Iterable<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, adminTex: AdminFacade<H>, time: number): Iterable<DatabaseOrderbook<H>>;
    getDatabaseTradeGroupsAfterId(marketName: string, adminTex: AdminFacade<H>, id: DatabaseTradeId): Iterable<DatabaseTrade<H>[]>;
    getDatabaseTradeGroupsAfterTime(marketName: string, adminTex: AdminFacade<H>, time: number): Iterable<DatabaseTrade<H>[]>;
    private start;
    private stop;
}
