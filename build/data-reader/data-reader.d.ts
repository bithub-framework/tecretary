import { Startable } from 'startable';
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { Config } from '../config';
export declare class DataReader<H extends HLike<H>> {
    private db;
    startable: Startable;
    private orderbookReader;
    private tradeGroupReader;
    constructor(config: Config, H: HStatic<H>);
    getDatabaseOrderbooksAfterId(marketName: string, adminTex: AdminTex<H>, id: DatabaseOrderbookId): Iterable<DatabaseOrderbook<H>>;
    getDatabaseOrderbooksAfterTime(marketName: string, adminTex: AdminTex<H>, time: number): Iterable<DatabaseOrderbook<H>>;
    getDatabaseTradeGroupsAfterId(marketName: string, adminTex: AdminTex<H>, id: DatabaseTradeId): Iterable<DatabaseTrade<H>[]>;
    getDatabaseTradeGroupsAfterTime(marketName: string, adminTex: AdminTex<H>, time: number): Iterable<DatabaseTrade<H>[]>;
    private start;
    private stop;
}
