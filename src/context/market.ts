import {
	MarketLike,
	AccountLike,
	HLike,
} from 'secretary-like';
import { UserMarketFacade } from 'texchange/build/facades.d/user-market';
import { MarketSpec } from 'secretary-like';
import { MarketEventEmitterLike } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange/texchange';
import { ContextAccout } from './account';



export class ContextMarket<H extends HLike<H>> implements MarketLike<H> {
	[accountId: number]: AccountLike<H>;
	public spec: MarketSpec<H>;
	public events: MarketEventEmitterLike<H>;
	private facade: UserMarketFacade<H>;

	constructor(
		texchange: Texchange<H>,
	) {
		this.facade = texchange.getUserMarketFacade();
		this.spec = this.facade.spec;
		this.events = this.facade.events;
		this[0] = new ContextAccout(texchange);
	}

	public quantity(price: H, dollarVolume: H): H {
		return this.facade.quantity(price, dollarVolume);
	};

	public dollarVolume(price: H, quantity: H): H {
		return this.facade.dollarVolume(price, quantity);
	}
}
