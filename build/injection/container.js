"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./types");
const node_time_engine_1 = require("node-time-engine");
const progress_reader_1 = require("../progress-reader");
const data_reader_1 = require("../data-reader");
const timeline_1 = require("../timeline/timeline");
const context_1 = require("../context");
const texchange_1 = require("texchange");
const tecretary_1 = require("../tecretary");
class Container extends injektor_1.BaseContainer {
    constructor() {
        super(...arguments);
        this[_a] = this.rfs(() => {
            return new texchange_1.DataTypesNamespace(this[types_1.TYPES.hFactory](), this[types_1.TYPES.hStatic]());
        });
        this[_b] = this.rcs(progress_reader_1.ProgressReader);
        this[_c] = this.rcs(data_reader_1.DataReader);
        this[_d] = this.rfs(() => {
            const progressReader = this[types_1.TYPES.progressReader]();
            return new timeline_1.Timeline(progressReader.getTime(), new node_time_engine_1.NodeTimeEngine());
        });
        this[_e] = this.rfs(() => {
            return {
                timeline: this[types_1.TYPES.timeline](),
                DataTypes: this[types_1.TYPES.TexchangeDataTypes](),
            };
        });
        this[_f] = this.rcs(context_1.Context);
        this[_g] = this.rfs(() => {
            const Strategy = this[types_1.TYPES.Strategy]();
            const ctx = this[types_1.TYPES.context]();
            return new Strategy(ctx);
        });
        this[_h] = this.rcs(tecretary_1.Tecretary);
    }
}
exports.Container = Container;
_a = types_1.TYPES.TexchangeDataTypes, _b = types_1.TYPES.progressReader, _c = types_1.TYPES.dataReader, _d = types_1.TYPES.timeline, _e = types_1.TYPES.vmctx, _f = types_1.TYPES.context, _g = types_1.TYPES.strategy, _h = types_1.TYPES.tecretary;
//# sourceMappingURL=container.js.map