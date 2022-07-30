import {
	AccountLike,
	HLike,
	LimitOrderLike,
	BalancesLike,
	PositionsLike,
	OpenOrderLike,
	AmendmentLike,
	AccountEvents,
} from 'secretary-like';
import {
	UserAccountFacade,
	Texchange,
} from 'texchange';
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

	public async makeOrders($orders: LimitOrderLike<H>[]): Promise<(OpenOrderLike<H> | Error)[]> {
		return await this.facade.makeOrders($orders);
	}

	public async amendOrders($amendments: AmendmentLike<H>[]): Promise<(OpenOrderLike<H> | Error)[]> {
		return await this.facade.amendOrders($amendments);
	}

	public async cancelOrders($orders: OpenOrderLike<H>[]): Promise<OpenOrderLike<H>[]> {
		return await this.facade.cancelOrders($orders);
	}

	public async getBalances(): Promise<BalancesLike<H>> {
		return await this.facade.getBalances();
	}

	public async getPositions(): Promise<PositionsLike<H>> {
		return await this.facade.getPositions();
	}

	public async getOpenOrders(): Promise<OpenOrderLike<H>[]> {
		return await this.facade.getOpenOrders();
	}
}
