"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tecretary = void 0;
const startable_1 = require("startable");
const data_reader_1 = require("./data-reader");
const progress_reader_1 = require("./progress-reader");
const context_1 = require("./context");
const check_points_1 = require("./check-points");
const timeline_1 = require("timeline");
const node_time_engine_1 = require("node-time-engine");
const throttle_1 = require("./throttle");
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
        this.dataReader = new data_reader_1.DataReader(config, this.progressReader, H);
        const checkPointsMaker = new check_points_1.CheckPointsMaker(this.dataReader, this.adminTexMap);
        const throttle = new throttle_1.Throttle(this.progressReader.getTime(), config.SNAPSHOT_PERIOD, () => this.progressReader.capture(this.timeline.now(), this.adminTexMap));
        this.timeline = new timeline_1.Timeline(this.progressReader.getTime(), checkPointsMaker.make(), nodeTimeEngine, () => { }, () => throttle.call(this.timeline.now()));
        const userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(typeof tex !== 'undefined');
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
            this.progressReader.capture(this.timeline.now(), this.adminTexMap);
            await this.timeline.startable.stop();
            await this.dataReader.startable.stop();
            await this.progressReader.startable.stop();
        }
    }
}
exports.Tecretary = Tecretary;
//# sourceMappingURL=tecretary.js.map