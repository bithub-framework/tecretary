import { Startable } from 'startable';
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { Config } from '../config';
export declare class DataReader<H extends HLike<H>> {
    private adminTexMap;
    private H;
    private db;
    startable: Startable;
    private orderbookReader;
    private tradeGroupReader;
    constructor(config: Config, adminTexMap: Map<string, AdminTex<H, unknown>>, H: HStatic<H>);
    getDatabaseOrderbooks(marketName: string, afterOrderbookId?: number): IterableIterator<DatabaseOrderbook<H>>;
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    private start;
    private stop;
}
