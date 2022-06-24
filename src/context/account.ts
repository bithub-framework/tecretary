import {
	AccountLike,
	HLike,
	LimitOrder,
	Balances,
	Positions,
	OpenOrder,
	Amendment,
	AccountEvents,
} from 'secretary-like';
import { UserAccountFacade } from 'texchange/build/facades.d/user-account';
import { Texchange } from 'texchange/build/texchange';
import { EventEmitter } from 'events';


export class ContextAccout<H extends HLike<H>>
	extends EventEmitter
	implements AccountLike<H>
{
	public on!: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
	public once!: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
	public off!: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
	public emit!: <Event extends keyof AccountEvents<H>>(event: Event, ...args: AccountEvents<H>[Event]) => boolean;

	public LEVERAGE: number;
	public TAKER_FEE_RATE: number;
	public MAKER_FEE_RATE: number;

	private facade: UserAccountFacade<H>;

	constructor(
		texchange: Texchange<H>,
	) {
		super();

		this.facade = texchange.getUserAccountFacade();

		this.LEVERAGE = this.facade.LEVERAGE;
		this.TAKER_FEE_RATE = this.facade.TAKER_FEE_RATE;
		this.MAKER_FEE_RATE = this.facade.MAKER_FEE_RATE;

		this.facade.on('positions', positions => {
			this.emit('positions', positions);
		});

		this.facade.on('balances', balances => {
			this.emit('balances', balances);
		});
	}

	public async makeOrders($orders: LimitOrder<H>[]): Promise<(OpenOrder<H> | Error)[]> {
		return await this.facade.makeOrders($orders);
	}

	public async amendOrders($amendments: Amendment<H>[]): Promise<(OpenOrder<H> | Error)[]> {
		return await this.facade.amendOrders($amendments);
	}

	public async cancelOrders($orders: OpenOrder<H>[]): Promise<OpenOrder<H>[]> {
		return await this.facade.cancelOrders($orders);
	}

	public async getBalances(): Promise<Balances<H>> {
		return await this.facade.getBalances();
	}

	public async getPositions(): Promise<Positions<H>> {
		return await this.facade.getPositions();
	}

	public async getOpenOrders(): Promise<OpenOrder<H>[]> {
		return await this.facade.getOpenOrders();
	}
}
