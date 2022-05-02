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
        this.lastSnapshotTime = Number.NEGATIVE_INFINITY;
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
        this.loop = async (sleep) => {
            for await (const v of this.timeline) {
                this.tryCapture();
                await sleep(0);
            }
        };
        this.adminTexMap = new Map([...texMap].map(([name, tex]) => [name, tex.admin]));
        this.progressReader = new progress_reader_1.ProgressReader(config);
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = this.progressReader.getSnapshot(name);
            if (snapshot !== null)
                tex.restore(snapshot);
        }
        this.dataReader = new data_reader_1.DataReader(config, this.adminTexMap, H);
        const orderbookDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => {
            const afterOrderbookId = adminTex.getLatestDatabaseOrderbookId();
            if (afterOrderbookId !== null)
                return (0, check_points_1.checkPointsFromDatabaseOrderbooks)(this.dataReader.getDatabaseOrderbooksAfterOrderbookId(marketName, Number.parseInt(afterOrderbookId)), adminTex);
            else
                return (0, check_points_1.checkPointsFromDatabaseOrderbooks)(this.dataReader.getDatabaseOrderbooksAfterTime(marketName, this.progressReader.getTime()), adminTex);
        });
        const tradesDataCheckPoints = [...this.adminTexMap].map(([marketName, adminTex]) => {
            const afterTradeId = adminTex.getLatestDatabaseTradeId();
            if (afterTradeId !== null)
                return (0, check_points_1.checkPointsFromDatabaseTradeGroups)(this.dataReader.getDatabaseTradeGroupsAfterTradeId(marketName, Number.parseInt(afterTradeId)), adminTex);
            else
                return (0, check_points_1.checkPointsFromDatabaseTradeGroups)(this.dataReader.getDatabaseTradeGroupsAfterTime(marketName, this.progressReader.getTime()), adminTex);
        });
        this.dataCheckPoints = (0, merge_1.sortMergeAll)((a, b) => a.time - b.time)(...orderbookDataCheckPoints, ...tradesDataCheckPoints);
        this.timeline = new timeline_1.Timeline(this.progressReader.getTime(), this.dataCheckPoints);
        const userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });
        this.strategy = new Strategy(new context_1.Context(userTexes, this.timeline));
        this.pollerloop = new pollerloop_1.Pollerloop(this.loop, nodeTimeEngine);
    }
    async start() {
        await this.progressReader.startable.start(this.startable.starp);
        await this.dataReader.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
        await this.pollerloop.startable.start(this.startable.starp);
    }
    async stop() {
        await this.strategy.startable.stop();
        this.capture();
        await this.pollerloop.startable.stop();
        await this.dataReader.startable.stop();
        await this.progressReader.startable.stop();
    }
    capture() {
        this.lastSnapshotTime = this.timeline.now();
        for (const [name, tex] of this.adminTexMap) {
            const snapshot = tex.capture();
            this.progressReader.setSnapshot(name, snapshot);
        }
    }
    tryCapture() {
        if (this.timeline.now() >=
            this.lastSnapshotTime +
                this.config.SNAPSHOT_PERIOD) {
            this.capture();
        }
    }
}
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map