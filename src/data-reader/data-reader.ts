import { Startable, StartableLike } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'secretary-like';
import { DatabaseOrderbook, DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade, DatabaseTradeId } from 'texchange/build/interfaces/database-trade';
import { Texchange } from 'texchange/build/texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';

import { TYPES } from '../injection/types';
import { inject } from '@zimtsui/injektor';



export class DataReader<H extends HLike<H>> implements StartableLike {
    private db: Database.Database;
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;

    private startable = Startable.create(
        () => this.rawStart(),
        () => this.rawStop(),
    );
    public start = this.startable.start;
    public stop = this.startable.stop;
    public assart = this.startable.assart;
    public starp = this.startable.starp;
    public getReadyState = this.startable.getReadyState;
    public skipStart = this.startable.skipStart;


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
        texchange: Texchange<H>,
        id: DatabaseOrderbookId,
        endTime: number,
    ): Generator<DatabaseOrderbook<H>, void> {
        return this.orderbookReader.getDatabaseOrderbooksAfterId(
            marketName,
            texchange,
            Number.parseInt(id),
            endTime,
        );
    }

    public getDatabaseOrderbooksAfterTime(
        marketName: string,
        texchange: Texchange<H>,
        afterTime: number,
        endTime: number,
    ): Generator<DatabaseOrderbook<H>, void> {
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(
            marketName,
            texchange,
            afterTime,
            endTime,
        );
    }

    public getDatabaseTradeGroupsAfterId(
        marketName: string,
        texchange: Texchange<H>,
        id: DatabaseTradeId,
        endTime: number,
    ): Generator<DatabaseTrade<H>[], void> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterId(
            marketName,
            texchange,
            Number.parseInt(id),
            endTime,
        );
    }

    public getDatabaseTradeGroupsAfterTime(
        marketName: string,
        texchange: Texchange<H>,
        afterTime: number,
        endTime: number,
    ): Generator<DatabaseTrade<H>[], void> {
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(
            marketName,
            texchange,
            afterTime,
            endTime,
        );
    }

    private async rawStart(): Promise<void> { }

    private async rawStop(): Promise<void> {
        this.db.close();
    }
}
