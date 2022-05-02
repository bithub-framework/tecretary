import { Startable } from 'startable';
import Database = require('better-sqlite3');
import { HStatic, HLike } from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { AdminTex } from 'texchange/build/texchange';
import { OrderbookReader } from './orderbook-reader';
import { TradeGroupReader } from './trade-group-reader';
import { Config } from '../config';
import { SnapshotReader } from './snapshot-reader';
import { Snapshot } from 'texchange/build/texchange';



export class DatabaseReader<H extends HLike<H>> {
    private dataDb: Database.Database;
    private projectsDb: Database.Database;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );
    private orderbookReader: OrderbookReader<H>;
    private tradeGroupReader: TradeGroupReader<H>;
    private snapshotReader: SnapshotReader;

    public constructor(
        config: Config,
        private adminTexMap: Map<string, AdminTex<H>>,
        private H: HStatic<H>,
    ) {
        this.dataDb = new Database(
            config.DATA_DB_FILE_PATH,
            {
                readonly: true,
                fileMustExist: true,
            },
        );

        this.projectsDb = new Database(
            config.PROJECTS_DB_FILE_PATH,
            {
                fileMustExist: true,
            },
        );

        this.orderbookReader = new OrderbookReader(
            this.dataDb,
            this.adminTexMap,
            this.H,
        );

        this.tradeGroupReader = new TradeGroupReader(
            this.dataDb,
            this.adminTexMap,
            this.H,
        );

        this.snapshotReader = new SnapshotReader(
            this.projectsDb,
            config,
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

    public getSnapshot<PricingSnapshot>(
        marketName: string,
    ): Snapshot<PricingSnapshot> | null {
        return this.snapshotReader.getSnapshot<PricingSnapshot>(marketName);
    }

    public setSnapshot<PricingSnapshot>(
        marketName: string,
        snapshot: Snapshot<PricingSnapshot>
    ): void {
        this.snapshotReader.setSnapshot(
            marketName,
            snapshot,
        );
    }

    private async start(): Promise<void> { }

    private async stop(): Promise<void> {
        this.dataDb.close();
    }
}
