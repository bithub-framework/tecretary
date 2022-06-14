import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';

import { TYPES } from '../injection/types';
import { inject } from '@zimtsui/injektor';



export class DataReader<H extends HLike<H>> {
    private db: Database.Database;
    public startable = Startable.create(
        () => this.start(),
        () => this.stop(),
    );
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;

    public constructor(
        @inject(TYPES.dataFilePath)
        filePath: string,
        @inject(TYPES.hStatic)
        H: HStatic<H>,
    ) {
        this.db = new Database(
            filePath,
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
        adminTex: AdminFacade<H>,
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
        adminTex: AdminFacade<H>,
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
        adminTex: AdminFacade<H>,
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
        adminTex: AdminFacade<H>,
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
