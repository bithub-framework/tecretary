import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';


export class DatabaseReader<H extends HLike<H>> {
    private db: Database.Database;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;

    public constructor(
        filePath: string,
        private H: HStatic<H>,
        private adminTexMap: Map<string, AdminTex<H>>,
    ) {
        this.db = new Database(filePath, {
            readonly: true,
            fileMustExist: true,
        });

        this.orderbookReader = new OrderbookReader(
            this.db,
            this.H,
            this.adminTexMap,
        );

        this.tradeGroupReader = new TradeGroupReader(
            this.db,
            this.H,
            this.adminTexMap,
        );
    }

    public getDatabaseOrderbooks(
        marketName: string,
        afterOrderbookId?: number,
    ): IterableIterator<DatabaseOrderbook<H>> {
        return this.orderbookReader.getDatabaseOrderbooks(
            marketName,
            afterOrderbookId,
        );
    }

    public getDatabaseTradeGroups(
        marketName: string,
        afterTradeId?: number,
    ): IterableIterator<DatabaseTrade<H>[]> {
        return this.tradeGroupReader.getDatabaseTradeGroups(
            marketName,
            afterTradeId,
        );
    }

    private async start(): Promise<void> { }

    private async stop(): Promise<void> {
        this.db.close();
    }
}
