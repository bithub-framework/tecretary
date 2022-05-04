"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecretary = void 0;
const startable_1 = require("startable");
const data_reader_1 = require("./data-reader");
const progress_reader_1 = require("./progress-reader");
const context_1 = require("./context");
const check_points_1 = require("./check-points");
const merge_1 = require("./merge");
const timeline_1 = require("timeline");
const regular_interval_1 = require("./regular-interval");
const node_time_engine_1 = require("node-time-engine");
const assert = require("assert");
const nodeTimeEngine = new node_time_engine_1.NodeTimeEngine();
class Tecretary {
    constructor(Strategy, config, texMap, H) {
        this.startable = new startable_1.Startable(() => this.start(), () => this.stop());
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
        const captureCheckPoints = (0, regular_interval_1.regularInverval)(this.progressReader.getTime(), config.SNAPSHOT_PERIOD, () => this.capture());
        const checkPoints = (0, merge_1.sortMergeAll)((a, b) => a.time - b.time)(...orderbookDataCheckPoints, ...tradesDataCheckPoints, captureCheckPoints);
        this.timeline = new timeline_1.Timeline(this.progressReader.getTime(), checkPoints, nodeTimeEngine);
        const userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });
        this.strategy = new Strategy(new context_1.Context(userTexes, this.timeline));
    }
    async start() {
        await this.progressReader.startable.start(this.startable.starp);
        await this.dataReader.startable.start(this.startable.starp);
        await this.timeline.startable.start(this.startable.starp);
        await this.strategy.startable.start(this.startable.starp);
    }
    async stop() {
        try {
            await this.strategy.startable.stop();
        }
        finally {
            this.capture();
            await this.timeline.startable.stop();
            await this.dataReader.startable.stop();
            await this.progressReader.startable.stop();
        }
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