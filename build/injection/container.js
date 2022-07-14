"use strict";
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./types");
const node_time_engine_1 = require("node-time-engine");
const progress_reader_1 = require("../progress-reader");
const data_reader_1 = require("../data-reader");
const timeline_1 = require("../timeline/timeline");
const context_1 = require("../context/context");
const tecretary_1 = require("../tecretary");
class Container extends injektor_1.BaseContainer {
    constructor() {
        super(...arguments);
        this[_a] = this.rcs(progress_reader_1.ProgressReader);
        this[_b] = this.rcs(data_reader_1.DataReader);
        this[_c] = this.rfs(() => {
            const progressReader = this[types_1.TYPES.progressReader]();
            return new timeline_1.Timeline(progressReader.getTime(), this[types_1.TYPES.endTime](), new node_time_engine_1.NodeTimeEngine());
        });
        this[_d] = this.rcs(context_1.Context);
        this[_e] = this.rcs(tecretary_1.Tecretary);
    }
}
exports.Container = Container;
_a = types_1.TYPES.progressReader, _b = types_1.TYPES.dataReader, _c = types_1.TYPES.timeline, _d = types_1.TYPES.context, _e = types_1.TYPES.tecretary;
//# sourceMappingURL=container.js.map