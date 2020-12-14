import Startable from 'startable';
import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import {
    InstanceConfig,
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
} from './interfaces';

class Context extends Startable implements ContextLike {
    [marketId: number]: ContextMarket;

    constructor(
        private config: InstanceConfig,
        public sleep: (ms: number) => Promise<void>,
    ) {
        super();
        for (const mid of this.config.markets.keys()) {
            this[mid] = new ContextMarket(this.config, mid);
        }
    }

    protected async _start() {
        for (const mid of this.config.markets.keys())
            await this[mid].start(err => this.stop(err).catch(() => { }));
    }

    protected async _stop() {
        for (const mid of this.config.markets.keys())
            await this[mid].stop();
    }

    public async next() { }
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;

    constructor(
        config: InstanceConfig,
        mid: number,
    ) {
        super(config, mid);
        const marketConfig = config.markets[mid];
        for (const aid of marketConfig.accounts.keys()) {
            this[aid] = new ContextAccount(config, mid, aid);
        }
    }
}

class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike { }

export {
    Context as default,
    Context,
}
