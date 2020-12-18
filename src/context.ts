import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import {
    ContextAccountLike,
    ContextMarketLike,
    ContextLike,
} from './interfaces';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';

class Context extends EventEmitter implements ContextLike {
    [marketId: number]: ContextMarket;

    constructor(
        texchange: Texchange,
        public sleep: (ms: number) => Promise<void>,
    ) {
        super();
        this[0] = new ContextMarket(texchange);
    }
}


class ContextMarket extends ContextMarketPublicApi implements ContextMarketLike {
    [accountId: number]: ContextAccount;

    constructor(
        texchange: Texchange,
    ) {
        super(texchange);
        this[0] = new ContextAccount(texchange);
    }
}


class ContextAccount extends ContextAccountPrivateApi implements ContextAccountLike { }

export {
    Context as default,
    Context,
}
