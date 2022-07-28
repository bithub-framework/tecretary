"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
const texchange_1 = require("texchange");
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
            const texchangeContainer = new texchange_1.DefaultContainer(this[__1.BASE_TYPES.timeline](), this[__1.BASE_TYPES.hFactory](), this[__1.BASE_TYPES.hStatic](), high_precision_1.bigHFactory.from(1000), high_precision_1.bigHFactory.from(7000));
            return new Map([[
                    'binance-perpetual-btcusdt',
                    texchangeContainer[texchange_1.DEFAULT_TYPES.texchange](),
                ]]);
        });
        this[_c] = this.rv(high_precision_1.bigHFactory);
        this[_d] = this.rv(high_precision_1.BigH);
        this[_e] = this.rv('../progress.db');
        this[_f] = this.rv('/media/1tb/tecretary.db');
        this[_g] = this.rv(1577807996537);
        this[_h] = this.rfs(() => this[__1.BASE_TYPES.startTime]() + 1 * 1 * 60 * 1000);
        this[_j] = this.rv(strategy_1.Strategy);
    }
}
_a = __1.BASE_TYPES.config, _b = __1.BASE_TYPES.texchangeMap, _c = __1.BASE_TYPES.hFactory, _d = __1.BASE_TYPES.hStatic, _e = __1.BASE_TYPES.progressFilePath, _f = __1.BASE_TYPES.dataFilePath, _g = __1.BASE_TYPES.startTime, _h = __1.BASE_TYPES.endTime, _j = __1.BASE_TYPES.Strategy;
const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[__1.BASE_TYPES.tecretary]();
(0, startable_adaptor_1.adapt)(tecretary, 3000, 3000, 3000);
//# sourceMappingURL=main.js.map