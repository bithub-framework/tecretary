import { Startable } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Context } from './context';
import { Texchange } from 'texchange/build/texchange';
import { AdminTex } from 'texchange/build/texchange';
import { UserTex } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic } from 'interfaces';
import { StrategyLike, StrategyStatic } from 'interfaces/build/secretaries/strategy-like';
import { CheckPointsMaker } from './check-points';
import { Timeline } from 'timeline';
import { NodeTimeEngine } from 'node-time-engine';
import { Throttle } from './throttle';
import assert = require('assert');
const nodeTimeEngine = new NodeTimeEngine();



export class Tecretary<H extends HLike<H>> {
    private progressReader: ProgressReader;
    private dataReader: DataReader<H>;
    private strategy: StrategyLike;
    private timeline: Timeline;
    private adminTexMap: Map<string, AdminTex<H, any>>;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        Strategy: StrategyStatic<H>,
        config: Config,
        texMap: Map<string, Texchange<H, any>>,
        H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        this.progressReader = new ProgressReader(
            config,
        );
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }

        this.dataReader = new DataReader(
            config,
            this.progressReader,
            H,
        );

        const checkPointsMaker = new CheckPointsMaker(
            this.dataReader,
            this.adminTexMap,
        );

        const throttle = new Throttle(
            this.progressReader.getTime(),
            config.SNAPSHOT_PERIOD,
            () => this.progressReader.capture(
                this.timeline.now(),
                this.adminTexMap,
            ),
        );

        this.timeline = new Timeline(
            this.progressReader.getTime(),
            checkPointsMaker.make(),
            nodeTimeEngine,
            () => { },
            () => throttle.call(this.timeline.now()),
        );

        const userTexes: UserTex<H>[] = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(typeof tex !== 'undefined');
            return tex.user;
        });
        this.strategy = new Strategy(
            new Context<H>(
                userTexes,
                this.timeline,
            )
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
