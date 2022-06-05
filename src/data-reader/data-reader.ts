import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
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
            H,
        );

        this.tradeGroupReader = new TradeGroupReader(
            this.db,
            H,
        );
    }

    public getDatabaseOrderbooksAfterId(
        marketName: string,
        adminTex: AdminTex<H>,
        id: DatabaseOrderbookId,
    ): Iterable<DatabaseOrderbook<H>> {
        return this.orderbookReader.getDatabaseOrderbooksAfterId(
            marketName,
            adminTex,
            Number.parseInt(id),
        );
    }

    public getDatabaseOrderbooksAfterTime(
        marketName: string,
        adminTex: AdminTex<H>,
        time: number,
    ): Iterable<DatabaseOrderbook<H>> {
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(
            marketName,
            adminTex,
            time,
        );
    }

    public getDatabaseTradeGroupsAfterId(
        marketName: string,
        adminTex: AdminTex<H>,
        id: DatabaseTradeId,
    ): Iterable<DatabaseTrade<H>[]> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterId(
            marketName,
            adminTex,
            Number.parseInt(id),
        );
    }

    public getDatabaseTradeGroupsAfterTime(
        marketName: string,
        adminTex: AdminTex<H>,
        time: number,
    ): Iterable<DatabaseTrade<H>[]> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(
            marketName,
            adminTex,
            time,
        );
    }

    private async start(): Promise<void> { }

    private async stop(): Promise<void> {
        this.db.close();
    }
}
