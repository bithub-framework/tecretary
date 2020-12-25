import { ContextAccountPrivateApi } from './private-api';
import { ContextMarketPublicApi } from './public-api';
import { EventEmitter } from 'events';
class Context extends EventEmitter {
    constructor(texchange, sleep, now, escape) {
        super();
        this.sleep = sleep;
        this.now = now;
        this.escape = escape;
        this[0] = new ContextMarket(texchange);
    }
}
class ContextMarket extends ContextMarketPublicApi {
    constructor(texchange) {
        super(texchange);
        this[0] = new ContextAccount(texchange);
    }
}
class ContextAccount extends ContextAccountPrivateApi {
}
export { Context as default, Context, };
//# sourceMappingURL=context.js.map