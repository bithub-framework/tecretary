import { Startable } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Texchange } from 'texchange/build/texchange';
import { AdminTex } from 'texchange/build/texchange';
import { Config } from './config';
import {
    HLike, HStatic,
    StrategyLike,
} from 'secretary-like';
import { makeCheckPoints } from './check-points';
import { Timeline } from './timeline/timeline';
import { inject } from 'injektor';
import { TYPES } from './injection/types';



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
            this.progressReader,
            this.H,
        );

        this.timeline.pushSortedCheckPoints(
            makeCheckPoints<H>(
                this.dataReader,
                this.adminTexMap,
            ),
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
            await this.strategy.startable.stop();
        } finally {
            this.progressReader.capture(
                this.timeline.now(),
                this.adminTexMap,
            );
            await this.timeline.startable.stop();
            await this.dataReader.startable.stop();
            await this.progressReader.startable.stop();
        }
    }
}
