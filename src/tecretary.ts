import { Startable, ReadyState } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange';
import { AdminTex } from 'texchange/build/texchange';
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
import { inject } from 'injektor';
import { TYPES } from './injection/types';
import { Shifterator } from 'shiftable';
import assert = require('assert');



export class Tecretary<H extends HLike<H>> {
    private dataReader: DataReader<H>;
    private adminTexMap: Map<string, AdminTex<H>>;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        @inject(TYPES.Config)
        private config: Config,
        @inject(TYPES.ProgressReader)
        private progressReader: ProgressReader,
        @inject(TYPES.Timeline)
        private timeline: Timeline,
        @inject(TYPES.TexMap)
        private texMap: Map<string, Texchange<H>>,
        @inject(TYPES.StrategyLike)
        private strategy: StrategyLike,
        @inject(TYPES.HStatic)
        private H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...this.texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null) tex.restore(snapshot);
        }

        this.dataReader = new DataReader(
            this.config,
            this.H,
        );

        for (const [marketName, adminTex] of this.adminTexMap) {
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
                    this.config.SNAPSHOT_PERIOD,
                    () => this.capture(),
                ),
            ),
        );
    }

    private capture(): void {
        this.progressReader.capture(
            this.timeline.now(),
            this.adminTexMap,
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
