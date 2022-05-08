"use strict";
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const injektor_1 = require("injektor");
const types_1 = require("./types");
const node_time_engine_1 = require("node-time-engine");
const progress_reader_1 = require("../progress-reader");
const timeline_1 = require("../timeline/timeline");
const context_1 = require("../context");
const tecretary_1 = require("../tecretary");
const assert = require("assert");
class Container extends injektor_1.BaseContainer {
    constructor(config) {
        super();
        this.config = config;
        this[_a] = this.rv(this.config);
        this[_b] = this.rcs(progress_reader_1.ProgressReader);
        this[_c] = this.rfs(() => {
            const progressReader = this[types_1.TYPES.ProgressReader]();
            return new timeline_1.Timeline(progressReader.getTime(), new node_time_engine_1.NodeTimeEngine());
        });
        this[_d] = () => this[types_1.TYPES.Timeline]();
        this[_e] = this.rfs(() => {
            const texMap = this[types_1.TYPES.TexMap]();
            const config = this[types_1.TYPES.Config]();
            const userTexes = config.markets.map(name => {
                const tex = texMap.get(name);
                assert(typeof tex !== 'undefined');
                return tex.user;
            });
            return userTexes;
        });
        this[_f] = this.rcs(context_1.Context);
        this[_g] = this.rcs(tecretary_1.Tecretary);
    }
}
exports.Container = Container;
_a = types_1.TYPES.Config, _b = types_1.TYPES.ProgressReader, _c = types_1.TYPES.Timeline, _d = types_1.TYPES.TimelineLike, _e = types_1.TYPES.UserTexes, _f = types_1.TYPES.Context, _g = types_1.TYPES.Tecretary;
//# sourceMappingURL=base.js.map