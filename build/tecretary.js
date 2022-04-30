"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecretary = void 0;
const startable_1 = require("startable");
const database_reader_1 = require("./database-reader/database-reader");
const context_1 = require("./context");
const timeline_1 = require("./timeline");
const check_points_1 = require("./check-points");
const merge_1 = require("./merge");
const pollerloop_1 = require("pollerloop");
const node_time_engine_1 = require("node-time-engine");
const assert = require("assert");
const nodeTimeEngine = new node_time_engine_1.NodeTimeEngine();
class Tecretary {
    constructor(Strategy, config, texMap, H) {
        this.H = H;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
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
        this.loop = async (sleep) => {
            for await (const v of this.timeline)
                await sleep(0);
        };
        this.adminTexMap = new Map([...texMap].map(([name, tex]) => [name, tex.admin]));
        this.reader = new database_reader_1.DatabaseReader(config.DB_FILE_PATH, this.adminTexMap, this.H);
        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });
        const orderbookDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => (0, check_points_1.checkPointsFromDatabaseOrderbooks)(this.reader.getDatabaseOrderbooks(marketName), adminTex));
        const tradesDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => (0, check_points_1.checkPointsFromDatabaseTradeGroups)(this.reader.getDatabaseTradeGroups(marketName), adminTex));
        this.dataCheckPoints = (0, merge_1.sortMergeAll)((a, b) => a.time - b.time)(...orderbookDataCheckPoints, ...tradesDataCheckPoints);
        this.timeline = new timeline_1.Timeline(config.startTime, this.dataCheckPoints);
        this.context = new context_1.Context(this.userTexes, this.timeline);
        this.strategy = new Strategy(this.context);
        this.pollerloop = new pollerloop_1.Pollerloop(this.loop, nodeTimeEngine);
    }
    async start() {
        await this.reader.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
        await this.pollerloop.startable.start(this.startable.starp);
    }
    async stop() {
        await this.strategy.startable.stop();
        await this.pollerloop.startable.stop();
        await this.reader.startable.stop();
    }
}
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map