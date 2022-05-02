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
        this.config = config;
        this.texMap = texMap;
        this.H = H;
        this.lastSnapshotTime = Number.NEGATIVE_INFINITY;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.loop = async (sleep) => {
            for await (const v of this.timeline) {
                const now = this.timeline.now();
                if (now >= this.lastSnapshotTime + this.config.SNAPSHOT_PERIOD) {
                    this.lastSnapshotTime = now;
                    this.capture();
                }
                await sleep(0);
            }
        };
        this.adminTexMap = new Map([...texMap].map(([name, tex]) => [name, tex.admin]));
        this.reader = new database_reader_1.DatabaseReader(config, this.adminTexMap, this.H);
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
    capture() {
        for (const [name, tex] of this.texMap) {
            const snapshot = tex.capture();
            this.reader.setSnapshot(name, snapshot);
        }
    }
}
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map