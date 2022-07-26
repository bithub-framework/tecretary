import { StartableLike } from 'startable';
import { HFactory, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { Texchange } from 'texchange/build/texchange';
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
    constructor(filePath: string, hFactory: HFactory<H>);
    getDatabaseOrderbooksAfterId(marketName: string, texchange: Texchange<H>, id: DatabaseOrderbookId, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseOrderbooksAfterTime(marketName: string, texchange: Texchange<H>, afterTime: number, endTime: number): Generator<DatabaseOrderbook<H>, void>;
    getDatabaseTradeGroupsAfterId(marketName: string, texchange: Texchange<H>, id: DatabaseTradeId, endTime: number): Generator<DatabaseTrade<H>[], void>;
    getDatabaseTradeGroupsAfterTime(marketName: string, texchange: Texchange<H>, afterTime: number, endTime: number): Generator<DatabaseTrade<H>[], void>;
    private rawStart;
    private rawStop;
}
