import {
    MarketLike,
    AccountLike,
    ContextLike,
    HLike,
    LimitOrder,
    Balances,
    Positions,
    TimelineLike,
    OpenOrder,
    Amendment,
} from 'secretary-like';
import { UserMarketFacade } from 'texchange/build/facades.d/user-market';
import { UserAccountFacade } from 'texchange/build/facades.d/user-account';
import { Texchange } from 'texchange/build/texchange/texchange';
import { ProgressReader } from './progress-reader';
import { Config } from './config';
import assert = require('assert');

import { inject } from '@zimtsui/injektor';
import { TYPES } from './injection/types';



export class Context<H extends HLike<H>> implements ContextLike<H> {
    [marketId: number]: MarketLike<H>;

    constructor(
        @inject(TYPES.Config)
        config: Config,
        @inject(TYPES.TexchangeMap)
        texchangeMap: Map<string, Texchange<H>>,
        @inject(TYPES.TimelineLike)
        public timeline: TimelineLike,
        @inject(TYPES.ProgressReader)
        private progressReader: ProgressReader,
    ) {
        const texchanges: Texchange<H>[] = config.marketNames.map(name => {
            const texchange = texchangeMap.get(name);
            assert(typeof texchange !== 'undefined');
            return texchange;
        });

        for (let i = 0; i < texchanges.length; i++) {
            this[i] = new ContextMarket(
                texchanges[i].getUserMarketFacade(),
                texchanges[i].getUserAccountFacade(),
            );
        }
    }

    public submit(content: string): void {
        this.progressReader.log(
            content,
            this.timeline.now(),
        );
    }
}


class ContextMarket<H extends HLike<H>> implements MarketLike<H> {
    [accountId: number]: AccountLike<H>;
    public spec = this.market.spec;
    public events = this.market.events;

    constructor(
        private market: UserMarketFacade<H>,
        account: UserAccountFacade<H>,
    ) {
        this[0] = new ContextAccout(account);
    }

    public quantity(price: H, dollarVolume: H): H {
        return this.market.quantity(price, dollarVolume);
    };

    public dollarVolume(price: H, quantity: H): H {
        return this.market.dollarVolume(price, quantity);
    }
}


class ContextAccout<H extends HLike<H>> implements AccountLike<H> {
    public spec = this.account.spec
    public events = this.account.events;

    constructor(
        private account: UserAccountFacade<H>,
    ) { }

    public async makeOrders($orders: LimitOrder<H>[]): Promise<(OpenOrder<H> | Error)[]> {
        return await this.account.makeOrders($orders);
    }

    public async amendOrders($amendments: Amendment<H>[]): Promise<(OpenOrder<H> | Error)[]> {
        return await this.account.amendOrders($amendments);
    }

    public async cancelOrders($orders: OpenOrder<H>[]): Promise<OpenOrder<H>[]> {
        return await this.account.cancelOrders($orders);
    }

    public async getBalances(): Promise<Balances<H>> {
        return await this.account.getBalances();
    }

    public async getPositions(): Promise<Positions<H>> {
        return await this.account.getPositions();
    }

    public async getOpenOrders(): Promise<OpenOrder<H>[]> {
        return await this.account.getOpenOrders();
    }
}
