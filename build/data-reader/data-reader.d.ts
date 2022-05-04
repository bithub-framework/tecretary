import { Startable } from 'startable';
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { ProgressReader } from '../progress-reader';
import { Config } from '../config';
export declare class DataReader<H extends HLike<H>> {
    private progressReader;
    private db;
    startable: Startable;
    private orderbookReader;
    private tradeGroupReader;
    constructor(config: Config, progressReader: ProgressReader, H: HStatic<H>);
    getDatabaseOrderbooks(marketName: string, adminTex: AdminTex<H, unknown>): IterableIterator<DatabaseOrderbook<H>>;
    getDatabaseTradeGroups(marketName: string, adminTex: AdminTex<H, unknown>): IterableIterator<DatabaseTrade<H>[]>;
    private start;
    private stop;
}
