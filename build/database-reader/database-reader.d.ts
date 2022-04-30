import { Startable } from 'startable';
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
export declare class DatabaseReader<H extends HLike<H>> {
    private H;
    private adminTexMap;
    private db;
    startable: Startable;
    private orderbookReader;
    private tradeGroupReader;
    constructor(filePath: string, H: HStatic<H>, adminTexMap: Map<string, AdminTex<H>>);
    getDatabaseOrderbooks(marketName: string, afterOrderbookId?: number): IterableIterator<DatabaseOrderbook<H>>;
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    private start;
    private stop;
}
