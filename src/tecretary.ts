import { Startable, StartableLike } from 'startable';
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
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        Strategy: StrategyStatic<H>,
        config: Config<H>,
        texMap: Map<string, Texchange<H, unknown>>,
        private H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        this.reader = new DatabaseReader(
            config.DB_FILE_PATH,
            this.H,
            this.adminTexMap,
        )

        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });

        const orderbookDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => checkPointsFromDatabaseOrderbooks(
                this.reader.getDatabaseOrderbooks(
                    marketName,
                ),
                adminTex,
            ),
        );

        const tradesDataCheckPoints = [...this.adminTexMap].map(
            ([marketName, adminTex]) => checkPointsFromDatabaseTradeGroups(
                this.reader.getDatabaseTradeGroups(
                    marketName,
                ),
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

    // private async readInitialAssets(): Promise<InitialAssets | void> {
    //     const res = await fetch(
    //         `${REDIRECTOR_URL}/secretariat/assets/latest?id=${this.config.projectId}`);
    //     if (res.ok) {
    //         const assets = <Assets>JSON.parse(
    //             JSON.stringify(<StringifiedAssets>await res.json()),
    //             reviver,
    //         );
    //         return {
    //             balance: assets.balance,
    //             time: assets.time,
    //         };
    //     }
    // }

    private loop: Loop = async sleep => {
        for await (const v of this.timeline)
            await sleep(0);
    }
}
