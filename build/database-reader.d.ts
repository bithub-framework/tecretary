import { Startable } from 'startable';
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/use-cases.d/update-orderbook';
import { DatabaseTrade } from 'texchange/build/use-cases.d/update-trades';
import { AdminTex } from 'texchange/build/texchange';
export declare class DatabaseReader<H extends HLike<H>> {
    private H;
    private adminTexMap;
    private db;
    startable: Startable;
    constructor(filePath: string, H: HStatic<H>, adminTexMap: Map<string, AdminTex<H>>);
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    private databaseTradeGroupsFromDatabaseTrades;
    private databaseTradesFromRawTrades;
    private getRawTrades;
    private getRawTradesAfterTradeId;
    getDatabaseOrderbooks(marketName: string, afterOrderbookId?: number): IterableIterator<DatabaseOrderbook<H>>;
    private rawBookOrderGroupsFromRawBookOrders;
    private databaseOrderbooksFromRawBookOrderGroups;
    private getRawBookOrders;
    private getRawBookOrdersAfterOrderbookId;
    private start;
    private stop;
}
