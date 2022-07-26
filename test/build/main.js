"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
const texchange_1 = require("texchange");
const types_1 = require("texchange/build/injection/default/types");
const __1 = require("../..");
const high_precision_1 = require("high-precision");
const strategy_1 = require("./strategy");
const startable_adaptor_1 = require("startable-adaptor");
class TecretaryContainer extends __1.BaseContainer {
    constructor() {
        super(...arguments);
        this[_a] = this.rv({
            projectName: 'test',
            marketNames: ['binance-perpetual-btcusdt'],
            snapshotPeriod: Number.POSITIVE_INFINITY,
            continue: false,
        });
        this[_b] = this.rfs(() => {
            const texchangeContainer = new texchange_1.DefaultContainer(this[__1.TYPES.timeline](), this[__1.TYPES.hStatic](), new high_precision_1.BigH(1000), new high_precision_1.BigH(7000));
            return new Map([[
                    'binance-perpetual-btcusdt',
                    texchangeContainer[types_1.TYPES.texchange](),
                ]]);
        });
        this[_c] = this.rv(high_precision_1.BigH);
        this[_d] = this.rv('../progress.db');
        this[_e] = this.rv('/media/1tb/tecretary.db');
        this[_f] = this.rv(1577807996537);
        this[_g] = this.rfs(() => this[__1.TYPES.startTime]() + 1 * 60 * 60 * 1000);
        this[_h] = this.rfs(() => new strategy_1.Strategy(this[__1.TYPES.context]()));
    }
}
_a = __1.TYPES.config, _b = __1.TYPES.texchangeMap, _c = __1.TYPES.hStatic, _d = __1.TYPES.progressFilePath, _e = __1.TYPES.dataFilePath, _f = __1.TYPES.startTime, _g = __1.TYPES.endTime, _h = __1.TYPES.strategy;
const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[__1.TYPES.tecretary]();
(0, startable_adaptor_1.adapt)(tecretary, 3000, 3000, 3000);
//# sourceMappingURL=main.js.map