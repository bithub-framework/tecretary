import { createStartable } from 'startable';
import Database = require('better-sqlite3');
import {
    HFactory, HLike,
    MarketSpec,
} from 'secretary-like';
import {
    DatabaseOrderbook,
    DatabaseOrderbookId,
    DatabaseTrade,
    DatabaseTradeId,
    DataTypesNamespace as TexchangeDataTypesNamespace
} from 'texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';
import { DataReaderLike } from '../data-reader-like';

import { TYPES } from '../injection/types';
import { inject } from '@zimtsui/injektor';



export class DataReader<H extends HLike<H>> implements DataReaderLike<H> {
    private db: Database.Database;
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;

    public $s = createStartable(
        () => this.rawStart(),
        () => this.rawStop(),
    );

    public constructor(
        @inject(TYPES.dataFilePath)
        filePath: string,
        @inject(TYPES.TexchangeDataTypes)
        DataTypes: TexchangeDataTypesNamespace<H>,
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
            DataTypes,
        );

        this.tradeGroupReader = new TradeGroupReader(
            this.db,
            DataTypes,
        );
    }

    public getDatabaseOrderbooksAfterId(
        marketName: string,
        marketSpec: MarketSpec<H>,
        id: DatabaseOrderbookId,
        endTime: number,
    ): Generator<DatabaseOrderbook<H>, void> {
        this.$s.assertReadyState('getDatabaseOrderbooksAfterId');
        return this.orderbookReader.getDatabaseOrderbooksAfterId(
            marketName,
            marketSpec,
            Number.parseInt(id),
            endTime,
        );
    }

    public getDatabaseOrderbooksAfterTime(
        marketName: string,
        marketSpec: MarketSpec<H>,
        afterTime: number,
        endTime: number,
    ): Generator<DatabaseOrderbook<H>, void> {
        this.$s.assertReadyState('getDatabaseOrderbooksAfterTime');
        return this.orderbookReader.getDatabaseOrderbooksAfterTime(
            marketName,
            marketSpec,
            afterTime,
            endTime,
        );
    }

    public getDatabaseTradeGroupsAfterId(
        marketName: string,
        marketSpec: MarketSpec<H>,
        id: DatabaseTradeId,
        endTime: number,
    ): Generator<DatabaseTrade<H>[], void> {
        this.$s.assertReadyState('getDatabaseTradeGroupsAfterId');
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterId(
            marketName,
            marketSpec,
            Number.parseInt(id),
            endTime,
        );
    }

    public getDatabaseTradeGroupsAfterTime(
        marketName: string,
        marketSpec: MarketSpec<H>,
        afterTime: number,
        endTime: number,
    ): Generator<DatabaseTrade<H>[], void> {
        this.$s.assertReadyState('getDatabaseTradeGroupsAfterTime');
        return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(
            marketName,
            marketSpec,
            afterTime,
            endTime,
        );
    }

    private async rawStart(): Promise<void> { }

    private async rawStop(): Promise<void> {
        this.db.close();
    }
}
