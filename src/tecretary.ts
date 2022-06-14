import { Startable, ReadyState } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange/texchange';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { Config } from './config';
import {
    HLike, HStatic,
    StrategyLike,
} from 'secretary-like';
import {
    makePeriodicCheckPoints,
    makeOrderbookCheckPoints,
    makeTradeGroupCheckPoints,
} from './check-points';
import { Timeline } from './timeline/timeline';
import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';
import { Shifterator } from 'shiftable';
import assert = require('assert');



export class Tecretary<H extends HLike<H>> {
    private adminFacadeMap: Map<string, AdminFacade<H>>;
    public startable = Startable.create(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        @inject(TYPES.config)
        private config: Config,
        @inject(TYPES.progressReader)
        private progressReader: ProgressReader,
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
        this.adminFacadeMap = new Map(
            [...this.texchangeMap].map(
                ([name, texchange]) => [name, texchange.getAdminFacade()],
            ),
        );

        for (const [name, tex] of this.adminFacadeMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null) tex.restore(snapshot);
        }

        for (const [marketName, adminTex] of this.adminFacadeMap) {
            const bookId = adminTex.getLatestDatabaseOrderbookId();
            const orderbooks = bookId !== null
                ? this.dataReader.getDatabaseOrderbooksAfterId(marketName, adminTex, bookId)
                : this.dataReader.getDatabaseOrderbooksAfterTime(marketName, adminTex, this.progressReader.getTime());
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeOrderbookCheckPoints<H>(
                        orderbooks,
                        adminTex,
                    ),
                ),
            );

            const tradeId = adminTex.getLatestDatabaseTradeId();
            const tradeGroups = tradeId !== null
                ? this.dataReader.getDatabaseTradeGroupsAfterId(marketName, adminTex, tradeId)
                : this.dataReader.getDatabaseTradeGroupsAfterTime(marketName, adminTex, this.progressReader.getTime());
            this.timeline.merge(
                Shifterator.fromIterable(
                    makeTradeGroupCheckPoints<H>(
                        tradeGroups,
                        adminTex,
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
            this.adminFacadeMap,
        );
    }

    private async start() {
        await this.progressReader.startable.start(this.startable.starp)
        await this.dataReader.startable.start(this.startable.starp);
        await this.timeline.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
    }

    private async stop() {
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
