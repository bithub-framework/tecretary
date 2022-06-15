import { MarketLike, AccountLike, HLike } from 'secretary-like';
import { MarketSpec } from 'secretary-like';
import { MarketEventEmitterLike } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange/texchange';
export declare class ContextMarket<H extends HLike<H>> implements MarketLike<H> {
    [accountId: number]: AccountLike<H>;
    spec: MarketSpec<H>;
    events: MarketEventEmitterLike<H>;
    private facade;
    constructor(texchange: Texchange<H>);
    quantity(price: H, dollarVolume: H): H;
    dollarVolume(price: H, quantity: H): H;
}
