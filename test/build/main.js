"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
const texchange_1 = require("texchange");
const __1 = require("../..");
const high_precision_1 = require("high-precision");
const strategy_1 = require("./strategy");
const startable_adaptor_1 = require("startable-adaptor");
class TECRETARY_TYPES extends __1.BASE_TYPES {
}
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
            const texchangeContainer = new texchange_1.DefaultContainer(this[TECRETARY_TYPES.timeline](), this[TECRETARY_TYPES.hFactory](), this[TECRETARY_TYPES.hStatic](), high_precision_1.bigDecimalHFactory.from(1000), high_precision_1.bigDecimalHFactory.from(7000));
            return new Map([[
                    'binance-perpetual-btcusdt',
                    texchangeContainer[texchange_1.DEFAULT_TYPES.texchange](),
                ]]);
        });
        this[_c] = this.rv(high_precision_1.bigDecimalHFactory);
        this[_d] = this.rv(high_precision_1.BigDecimalH);
        this[_e] = this.rv('../progress.db');
        this[_f] = this.rv('/media/1tb/tecretary.db');
        this[_g] = this.rv(1577807996537);
        this[_h] = this.rfs(() => this[TECRETARY_TYPES.startTime]() + 1 * 60 * 60 * 1000);
        this[_j] = this.rv(strategy_1.Strategy);
    }
}
_a = TECRETARY_TYPES.config, _b = TECRETARY_TYPES.texchangeMap, _c = TECRETARY_TYPES.hFactory, _d = TECRETARY_TYPES.hStatic, _e = TECRETARY_TYPES.progressFilePath, _f = TECRETARY_TYPES.dataFilePath, _g = TECRETARY_TYPES.startTime, _h = TECRETARY_TYPES.endTime, _j = TECRETARY_TYPES.Strategy;
const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[TECRETARY_TYPES.tecretary]();
(0, startable_adaptor_1.adapt)(tecretary, 3000, 3000, 3000);
//# sourceMappingURL=main.js.map