import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';
import { ProgressReader } from '../progress-reader';
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
        private progressReader: ProgressReader,
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

    public getDatabaseOrderbooks(
        marketName: string,
        adminTex: AdminTex<H, unknown>,
    ): IterableIterator<DatabaseOrderbook<H>> {
        const afterOrderbookId = adminTex.getLatestDatabaseOrderbookId();
        if (afterOrderbookId !== null)
            return this.orderbookReader.getDatabaseOrderbooksAfterOrderbookId(
                marketName,
                adminTex,
                Number.parseInt(afterOrderbookId),
            );
        else
            return this.orderbookReader.getDatabaseOrderbooksAfterTime(
                marketName,
                adminTex,
                this.progressReader.getTime(),
            );
    }

    public getDatabaseTradeGroups(
        marketName: string,
        adminTex: AdminTex<H, unknown>,
    ): IterableIterator<DatabaseTrade<H>[]> {
        const afterTradeId = adminTex.getLatestDatabaseTradeId();
        if (afterTradeId !== null)
            return this.tradeGroupReader.getDatabaseTradeGroupsAfterTradeId(
                marketName,
                adminTex,
                Number.parseInt(afterTradeId),
            );
        else
            return this.tradeGroupReader.getDatabaseTradeGroupsAfterTime(
                marketName,
                adminTex,
                this.progressReader.getTime(),
            );
    }

    private async start(): Promise<void> { }

    private async stop(): Promise<void> {
        this.db.close();
    }
}
