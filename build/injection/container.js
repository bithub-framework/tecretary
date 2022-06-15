"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("./types");
const node_time_engine_1 = require("node-time-engine");
const progress_reader_1 = require("../progress-reader");
const timeline_1 = require("../timeline/timeline");
const context_1 = require("../context/context");
const tecretary_1 = require("../tecretary");
class Container extends injektor_1.BaseContainer {
    constructor() {
        super(...arguments);
        this[_a] = this.rcs(progress_reader_1.ProgressReader);
        this[_b] = this.rfs(() => {
            const progressReader = this[types_1.TYPES.progressReader]();
            return new timeline_1.Timeline(progressReader.getTime(), new node_time_engine_1.NodeTimeEngine());
        });
        this[_c] = this.rcs(context_1.Context);
        this[_d] = this.rcs(tecretary_1.Tecretary);
    }
}
exports.Container = Container;
_a = types_1.TYPES.progressReader, _b = types_1.TYPES.timeline, _c = types_1.TYPES.context, _d = types_1.TYPES.tecretary;
//# sourceMappingURL=container.js.map