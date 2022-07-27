import {
    Startable,
    ReadyState,
    StartableLike,
} from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange';
import { Config } from './config';
import {
    HLike, HFactory,
    StrategyLike,
} from 'secretary-like';
import { makePeriodicCheckPoints } from './check-points/periodic';
import { makeOrderbookCheckPoints } from './check-points/orderbook';
import { makeTradeGroupCheckPoints } from './check-points/trade-group';
import { Timeline } from './timeline/timeline';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import { Shifterator } from 'shiftable';
import { CheckPoint } from './timeline/time-engine';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';



export class Tecretary<H extends HLike<H>> implements StartableLike {
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

    private tradeGroupsMap = new Map<string, Generator<DatabaseTrade<H>[], void>>();
    private orderbooksMap = new Map<string, Generator<DatabaseOrderbook<H>, void>>();


    public constructor(
        @inject(TYPES.config)
        private config: Config,
        @inject(TYPES.progressReader)
        private progressReader: ProgressReader<H>,
        @inject(TYPES.timeline)
        private timeline: Timeline,
        @inject(TYPES.texchangeMap)
        private texchangeMap: Map<string, Texchange<H>>,
        @inject(TYPES.strategy)
        private strategy: StrategyLike,
        @inject(TYPES.hFactory)
        private hFactory: HFactory<H>,
        @inject(TYPES.dataReader)
        private dataReader: DataReader<H>,
        @inject(TYPES.endTime)
        endTime: number,
    ) {
        for (const [name, texchange] of this.texchangeMap) {
            const facade = texchange.getAdminFacade();
            const marketSpec = facade.getMarketSpec();

            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null) facade.restore(snapshot);

            const bookId = facade.getLatestDatabaseOrderbookId();
            const orderbooks = bookId !== null
                ? this.dataReader.getDatabaseOrderbooksAfterId(
                    name, marketSpec,
                    bookId, endTime,
                ) : this.dataReader.getDatabaseOrderbooksAfterTime(
                    name, marketSpec,
                    this.progressReader.getTime(), endTime,
                );
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeOrderbookCheckPoints<H>(
                        orderbooks,
                        texchange,
                    ),
                ),
            );
            this.orderbooksMap.set(name, orderbooks);

            const tradeId = facade.getLatestDatabaseTradeId();
            const tradeGroups = tradeId !== null
                ? this.dataReader.getDatabaseTradeGroupsAfterId(
                    name, marketSpec,
                    tradeId, endTime,
                ) : this.dataReader.getDatabaseTradeGroupsAfterTime(
                    name, marketSpec,
                    this.progressReader.getTime(), endTime,
                );
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeTradeGroupCheckPoints<H>(
                        tradeGroups,
                        texchange,
                    ),
                ),
            );
            this.tradeGroupsMap.set(name, tradeGroups);
        }

        // this.timeline.affiliate(
        //     Shifterator.fromIterable(
        //         makePeriodicCheckPoints(
        //             this.timeline.now(),
        //             this.config.snapshotPeriod,
        //             () => this.capture(),
        //         ),
        //     ),
        // );
    }

    private capture(): void {
        this.progressReader.capture(
            this.timeline.now(),
            this.texchangeMap,
        );
    }

    private async rawStart() {
        await this.progressReader.start(this.starp);
        await this.dataReader.start(this.starp);
        await this.timeline.start(this.starp);
        await this.strategy.start(this.starp);
    }

    private async rawStop() {
        try {
            if (this.timeline.getReadyState() === ReadyState.STARTED)
                await this.strategy.stop();
        } finally {
            this.capture();
            await this.timeline.stop();
            for (const tradeGroups of this.tradeGroupsMap.values())
                tradeGroups.return();
            for (const orderbooks of this.orderbooksMap.values())
                orderbooks.return();
            await this.dataReader.stop();
            await this.progressReader.stop();
        }
    }
}
