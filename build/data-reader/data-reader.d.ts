import { StartableLike } from 'startable';
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { AdminFacade } from 'texchange/build/facades.d/admin';
export declare class DataReader<H extends HLike<H>> implements StartableLike {
    private db;
    private orderbookReader;
    private tradeGroupReader;
    private startable;
    start: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    stop: (err?: Error | undefined) => Promise<void>;
    assart: (onStopping?: import("startable").OnStopping | undefined) => Promise<void>;
    starp: (err?: Error | undefined) => Promise<void>;
    getReadyState: () => import("startable").ReadyState;
    skipStart: (onStopping?: import("startable").OnStopping | undefined) => void;
    constructor(filePath: string, H: HStatic<H>);
    getDatabaseOrderbooksAfterId(marketName: string, adminTex: AdminFacade<H>, id: DatabaseOrderbookId): Iterable<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, adminTex: AdminFacade<H>, time: number): Iterable<DatabaseOrderbook<H>>;
    getDatabaseTradeGroupsAfterId(marketName: string, adminTex: AdminFacade<H>, id: DatabaseTradeId): Iterable<DatabaseTrade<H>[]>;
    getDatabaseTradeGroupsAfterTime(marketName: string, adminTex: AdminFacade<H>, time: number): Iterable<DatabaseTrade<H>[]>;
    private rawStart;
    private rawStop;
}
