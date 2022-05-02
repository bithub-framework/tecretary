import { Startable } from 'startable';
import { DataReader } from './data-reader';
import { ProgressReader } from './progress-reader';
import { Context } from './context';
import { Timeline } from './timeline';
import { Texchange } from 'texchange/build/texchange';
import { AdminTex } from 'texchange/build/texchange';
import { UserTex } from 'texchange/build/texchange';
import { Config } from './config';
import {
    HLike, HStatic,
} from 'interfaces';
import {
    StrategyLike, StrategyStatic,
} from 'interfaces/build/secretaries/strategy-like';
import {
    checkPointsFromDatabaseOrderbooks,
    checkPointsFromDatabaseTradeGroups,
} from './check-points';
import { sortMergeAll } from './merge';
import { Pollerloop, Loop } from 'pollerloop';
import { CheckPoint } from './time-engine';
import { NodeTimeEngine } from 'node-time-engine';
import assert = require('assert');
const nodeTimeEngine = new NodeTimeEngine();



export class Tecretary<H extends HLike<H>> {
    private dataReader: DataReader<H>;
    private progressReader: ProgressReader;
    private strategy: StrategyLike;
    private timeline: Timeline;
    private context: Context<H>;
    private adminTexMap: Map<string, AdminTex<H, unknown>>;
    private userTexes: UserTex<H>[];
    private dataCheckPoints: Iterator<CheckPoint>;
    private pollerloop: Pollerloop;
    private lastSnapshotTime = Number.NEGATIVE_INFINITY;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        Strategy: StrategyStatic<H>,
        private config: Config,
        texMap: Map<string, Texchange<H, unknown>>,
        private H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });

        this.dataReader = new DataReader(
            config,
            this.adminTexMap,
            this.H,
        );

        this.progressReader = new ProgressReader(
            config,
        );

        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }


        const orderbookDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => {
                const afterOrderbookId = adminTex.getLatestDatabaseOrderbookId();
                if (afterOrderbookId !== null)
                    return checkPointsFromDatabaseOrderbooks(
                        this.dataReader.getDatabaseOrderbooks(
                            marketName,
                            Number.parseInt(afterOrderbookId),
                        ),
                        adminTex,
                    );
                else
                    return checkPointsFromDatabaseOrderbooks(
                        this.dataReader.getDatabaseOrderbooks(marketName),
                        adminTex,
                    );
            },
        );

        const tradesDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => {
                const afterTradeId = adminTex.getLatestDatabaseTradeId();
                if (afterTradeId !== null)
                    return checkPointsFromDatabaseTradeGroups(
                        this.dataReader.getDatabaseTradeGroups(
                            marketName,
                            Number.parseInt(afterTradeId),
                        ),
                        adminTex,
                    );
                else
                    return checkPointsFromDatabaseTradeGroups(
                        this.dataReader.getDatabaseTradeGroups(marketName),
                        adminTex,
                    );
            },
        );

        this.dataCheckPoints = sortMergeAll<CheckPoint>(
            (a, b) => a.time - b.time,
        )(
            ...orderbookDataCheckPoints,
            ...tradesDataCheckPoints,
        );

        this.timeline = new Timeline(
            this.progressReader.getTime(),
            this.dataCheckPoints
        );

        this.context = new Context<H>(
            this.userTexes,
            this.timeline,
        );

        this.strategy = new Strategy(
            this.context,
        );

        this.pollerloop = new Pollerloop(
            this.loop,
            nodeTimeEngine,
        );
    }

    private async start() {
        await this.dataReader.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
        await this.pollerloop.startable.start(this.startable.starp);
    }

    private async stop() {
        await this.strategy.startable.stop();
        await this.pollerloop.startable.stop();
        await this.dataReader.startable.stop();
    }

    private loop: Loop = async sleep => {
        for await (const v of this.timeline) {
            const now = this.timeline.now();
            if (now >= this.lastSnapshotTime + this.config.SNAPSHOT_PERIOD) {
                this.lastSnapshotTime = now;
                this.capture();
            }
            await sleep(0);
        }
    }

    private capture(): void {
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = tex.capture();
            this.progressReader.setSnapshot(name, snapshot);
        }
    }
}
