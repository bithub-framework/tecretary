"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecretary = void 0;
const startable_1 = require("startable");
const data_reader_1 = require("./data-reader");
const progress_reader_1 = require("./progress-reader");
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
        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });
        this.dataReader = new data_reader_1.DataReader(config, this.adminTexMap, this.H);
        this.progressReader = new progress_reader_1.ProgressReader(config);
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }
        const orderbookDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => {
            const afterOrderbookId = adminTex.getLatestDatabaseOrderbookId();
            if (afterOrderbookId !== null)
                return (0, check_points_1.checkPointsFromDatabaseOrderbooks)(this.dataReader.getDatabaseOrderbooks(marketName, Number.parseInt(afterOrderbookId)), adminTex);
            else
                return (0, check_points_1.checkPointsFromDatabaseOrderbooks)(this.dataReader.getDatabaseOrderbooks(marketName), adminTex);
        });
        const tradesDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => {
            const afterTradeId = adminTex.getLatestDatabaseTradeId();
            if (afterTradeId !== null)
                return (0, check_points_1.checkPointsFromDatabaseTradeGroups)(this.dataReader.getDatabaseTradeGroups(marketName, Number.parseInt(afterTradeId)), adminTex);
            else
                return (0, check_points_1.checkPointsFromDatabaseTradeGroups)(this.dataReader.getDatabaseTradeGroups(marketName), adminTex);
        });
        this.dataCheckPoints = (0, merge_1.sortMergeAll)((a, b) => a.time - b.time)(...orderbookDataCheckPoints, ...tradesDataCheckPoints);
        this.timeline = new timeline_1.Timeline(this.progressReader.getTime(), this.dataCheckPoints);
        this.context = new context_1.Context(this.userTexes, this.timeline);
        this.strategy = new Strategy(this.context);
        this.pollerloop = new pollerloop_1.Pollerloop(this.loop, nodeTimeEngine);
    }
    async start() {
        await this.dataReader.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
        await this.pollerloop.startable.start(this.startable.starp);
    }
    async stop() {
        await this.strategy.startable.stop();
        await this.pollerloop.startable.stop();
        await this.dataReader.startable.stop();
    }
    capture() {
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = tex.capture();
            this.progressReader.setSnapshot(name, snapshot);
        }
    }
}
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map