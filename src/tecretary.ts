import {
    Startable,
    ReadyState,
    StartableLike,
} from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange/texchange';
import { Config } from './config';
import {
    HLike, HStatic,
    StrategyLike,
} from 'secretary-like';
import { makePeriodicCheckPoints } from './check-points/periodic';
import { makeOrderbookCheckPoints } from './check-points/orderbook';
import { makeTradeGroupCheckPoints } from './check-points/trade-group';
import { Timeline } from './timeline/timeline';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import { Shifterator } from 'shiftable';
import assert = require('assert');



export class Tecretary<H extends HLike<H>> implements StartableLike {
    public startable = Startable.create(
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
        @inject(TYPES.hStatic)
        private H: HStatic<H>,
        @inject(TYPES.dataReader)
        private dataReader: DataReader<H>,
    ) {
        for (const [name, texchange] of this.texchangeMap) {
            const facade = texchange.getAdminFacade();

            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null) facade.restore(snapshot);

            const bookId = facade.getLatestDatabaseOrderbookId();
            const orderbooks = bookId !== null
                ? this.dataReader.getDatabaseOrderbooksAfterId(name, facade, bookId)
                : this.dataReader.getDatabaseOrderbooksAfterTime(name, facade, this.progressReader.getTime());
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeOrderbookCheckPoints<H>(
                        orderbooks,
                        texchange,
                    ),
                ),
            );

            const tradeId = facade.getLatestDatabaseTradeId();
            const tradeGroups = tradeId !== null
                ? this.dataReader.getDatabaseTradeGroupsAfterId(name, facade, tradeId)
                : this.dataReader.getDatabaseTradeGroupsAfterTime(name, facade, this.progressReader.getTime());
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeTradeGroupCheckPoints<H>(
                        tradeGroups,
                        texchange,
                    ),
                ),
            );
        }

        this.timeline.affiliate(
            Shifterator.fromIterable(
                makePeriodicCheckPoints(
                    this.timeline.now(),
                    this.config.snapshotPeriod,
                    () => this.capture(),
                ),
            ),
        );
    }

    private capture(): void {
        this.progressReader.capture(
            this.timeline.now(),
            this.texchangeMap,
        );
    }

    private async rawStart() {
        await this.progressReader.startable.start(this.startable.starp)
        await this.dataReader.startable.start(this.startable.starp);
        await this.timeline.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
    }

    private async rawStop() {
        try {
            assert(this.timeline.startable.getReadyState() === ReadyState.STARTED);
            await this.strategy.startable.stop();
        } finally {
            this.capture();
            await this.timeline.startable.stop();
            await this.dataReader.startable.stop();
            await this.progressReader.startable.stop();
        }
    }
}
