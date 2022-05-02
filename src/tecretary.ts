import { Startable } from 'startable';
import { DatabaseReader } from './database-reader/database-reader';
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
    private reader: DatabaseReader<H>;
    private strategy: StrategyLike;
    private timeline: Timeline;
    private context: Context<H>;
    private adminTexMap: Map<string, AdminTex<H>>;
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
        private texMap: Map<string, Texchange<H, unknown>>,
        private H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        this.reader = new DatabaseReader(
            config,
            this.adminTexMap,
            this.H,
        );

        for (const [name, tex] of texMap) {
            const snapshot = this.reader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }

        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });

        const orderbookDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => checkPointsFromDatabaseOrderbooks(
                this.reader.getDatabaseOrderbooks(marketName),
                adminTex,
            ),
        );

        const tradesDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => checkPointsFromDatabaseTradeGroups(
                this.reader.getDatabaseTradeGroups(marketName),
                adminTex,
            ),
        );

        this.dataCheckPoints = sortMergeAll<CheckPoint>(
            (a, b) => a.time - b.time,
        )(
            ...orderbookDataCheckPoints,
            ...tradesDataCheckPoints,
        );

        this.timeline = new Timeline(
            config.startTime,
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
        await this.reader.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
        await this.pollerloop.startable.start(this.startable.starp);
    }

    private async stop() {
        await this.strategy.startable.stop();
        await this.pollerloop.startable.stop();
        await this.reader.startable.stop();
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
        for (const [name, tex] of this.texMap) {
            const snapshot = tex.capture();
            this.reader.setSnapshot(name, snapshot);
        }
    }
}
