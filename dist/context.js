import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import assert from 'assert';
import { REDIRECTOR_URL } from './config';
class Context extends EventEmitter {
    constructor(texchange, config, setTimeout, clearTimeout, sleep, now, escape) {
        super();
        this.config = config;
        this.setTimeout = setTimeout;
        this.clearTimeout = clearTimeout;
        this.sleep = sleep;
        this.now = now;
        this.escape = escape;
        this[0] = new ContextMarket(texchange, config);
    }
    async submitAssets(assets) {
        const res = await this.escape(fetch(`${REDIRECTOR_URL}/secretariat/assets?id=${this.config.projectId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assets),
        }));
        assert(res.ok);
    }
}
class ContextMarket extends ContextMarketPublicApi {
    constructor(texchange, config) {
        super(texchange);
        this[0] = new ContextAccount(texchange, config);
        ({
            PRICE_DP: this.PRICE_DP,
            QUANTITY_DP: this.QUANTITY_DP,
            CURRENCY_DP: this.CURRENCY_DP,
            calcDollarVolume: this.calcDollarVolume,
        } = config);
    }
}
class ContextAccount extends ContextAccountPrivateApi {
    constructor(texchange, config) {
        super(texchange);
        ({
            leverage: this.leverage,
            MAKER_FEE_RATE: this.MAKER_FEE_RATE,
            TAKER_FEE_RATE: this.TAKER_FEE_RATE,
        } = config);
    }
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map