import {
	MarketLike,
	AccountLike,
	HLike,
	MarketEvents,
} from 'secretary-like';
import {
	UserMarketFacade,
	Texchange,
} from 'texchange';
import { EventEmitter } from 'events';
import { ContextAccout } from './account';
import { Startable } from 'startable';



export class ContextMarket<H extends HLike<H>>
	extends EventEmitter
	implements MarketLike<H>
{
	[accountId: number]: AccountLike<H>;

	public PRICE_SCALE: number;
	public QUANTITY_SCALE: number;
	public CURRENCY_SCALE: number;
	public TICK_SIZE: H;
	public MARKET_NAME: string;

	public on!: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
	public once!: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
	public off!: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
	public emit!: <Event extends keyof MarketEvents<H>>(event: Event, ...args: MarketEvents<H>[Event]) => boolean;

	public $s: Startable;

	private facade: UserMarketFacade<H>;

	constructor(
		texchange: Texchange<H>,
	) {
		super();

		this.facade = texchange.getUserMarketFacade();
		this.$s = texchange.getAdminFacade().$s;

		this.PRICE_SCALE = this.facade.PRICE_SCALE;
		this.QUANTITY_SCALE = this.facade.QUANTITY_SCALE;
		this.CURRENCY_SCALE = this.facade.CURRENCY_SCALE;
		this.TICK_SIZE = this.facade.TICK_SIZE;
		this.MARKET_NAME = this.facade.MARKET_NAME;

		this.facade.on('orderbook', orderbook => {
			this.emit('orderbook', orderbook);
		});

		this.facade.on('trades', trades => {
			this.emit('trades', trades);
		});

		this.facade.on('error', error => {
			this.emit('error', error);
		});

		this[0] = new ContextAccout(texchange);
	}

	public quantity(price: H, dollarVolume: H): H {
		return this.facade.quantity(price, dollarVolume);
	};

	public dollarVolume(price: H, quantity: H): H {
		return this.facade.dollarVolume(price, quantity);
	}
}
