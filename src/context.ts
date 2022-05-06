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
import { Latency } from 'texchange/build/facades.d/latency';
import { AccountLatency } from 'texchange/build/facades.d/latency/account'
import { MarketLatency } from 'texchange/build/facades.d/latency/market';



export class Context<H extends HLike<H>> implements ContextLike<H> {
    [marketId: number]: MarketLike<H>;

    constructor(
        userTexes: Latency<H>[],
        public timeline: TimelineLike,
    ) {
        for (let i = 0; i < userTexes.length; i++) {
            this[i] = new ContextMarket(
                userTexes[i].market,
                userTexes[i].account,
            );
        }
    }

    public async submit(key: string, json: string): Promise<void> { }

    // public async submitAssets(assets: Assets) {
    //     const res = await this.escape(fetch(
    //         `${REDIRECTOR_URL}/secretariat/assets?id=${this.config.projectId}`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(assets),
    //     }));
    //     assert(res.ok);
    // }
}


class ContextMarket<H extends HLike<H>> implements MarketLike<H> {
    [accountId: number]: AccountLike<H>;
    public spec = this.market.spec;
    public events = this.market.events;

    constructor(
        private market: MarketLatency<H>,
        account: AccountLatency<H>,
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
        private account: AccountLatency<H>,
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
