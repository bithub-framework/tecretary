import { Startable } from 'startable';
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { Config } from '../config';
import { Snapshot } from 'texchange/build/texchange';
export declare class DatabaseReader<H extends HLike<H>> {
    private adminTexMap;
    private H;
    private dataDb;
    private projectsDb;
    startable: Startable;
    private orderbookReader;
    private tradeGroupReader;
    private snapshotReader;
    constructor(config: Config, adminTexMap: Map<string, AdminTex<H>>, H: HStatic<H>);
    getDatabaseOrderbooks(marketName: string, afterOrderbookId?: number): IterableIterator<DatabaseOrderbook<H>>;
    getDatabaseTradeGroups(marketName: string, afterTradeId?: number): IterableIterator<DatabaseTrade<H>[]>;
    getSnapshot<PricingSnapshot>(marketName: string): Snapshot<PricingSnapshot> | null;
    setSnapshot<PricingSnapshot>(marketName: string, snapshot: Snapshot<PricingSnapshot>): void;
    private start;
    private stop;
}
