import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';
import { Config } from '../config';



export class DataReader<H extends HLike<H>> {
    private db: Database.Database;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;

    public constructor(
        config: Config,
        adminTexMap: Map<string, AdminTex<H, unknown>>,
        H: HStatic<H>,
    ) {
        this.db = new Database(
            config.DATA_DB_FILE_PATH,
            {
                readonly: true,
                fileMustExist: true,
            },
        );

        this.orderbookReader = new OrderbookReader(
            this.db,
            adminTexMap,
            H,
        );

        this.tradeGroupReader = new TradeGroupReader(
            this.db,
            adminTexMap,
            H,
        );
    }

    public getDatabaseOrderbooksAfterOrderbookId(
        marketName: string,
        afterOrderbookId: number,
    ): IterableIterator<DatabaseOrderbook<H>> {
        return this.orderbookReader.getDatabaseOrderbooksAfterOrderbookId(
            marketName,
            afterOrderbookId,
        );
    }

    public getDatabaseOrderbooksAfterTime(
        marketName: string,
        afterTime: number,
    ): IterableIterator<DatabaseOrderbook<H>> {
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(
            marketName,
            afterTime,
        );
    }

    public getDatabaseTradeGroupsAfterTradeId(
        marketName: string,
        afterTradeId: number,
    ): IterableIterator<DatabaseTrade<H>[]> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTradeId(
            marketName,
            afterTradeId,
        );
    }

    public getDatabaseTradeGroupsAfterTime(
        marketName: string,
        afterTime: number,
    ): IterableIterator<DatabaseTrade<H>[]> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(
            marketName,
            afterTime,
        );
    }

    private async start(): Promise<void> { }

    private async stop(): Promise<void> {
        this.db.close();
    }
}
