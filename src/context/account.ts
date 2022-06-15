import {
	AccountLike,
	HLike,
	LimitOrder,
	Balances,
	Positions,
	OpenOrder,
	Amendment,
} from 'secretary-like';
import { UserAccountFacade } from 'texchange/build/facades.d/user-account';
import { AccountSpec } from 'secretary-like';
import { AccountEventEmitterLike } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange/texchange';


export class ContextAccout<H extends HLike<H>> implements AccountLike<H> {
	public spec: AccountSpec;
	public events: AccountEventEmitterLike<H>;
	private facade: UserAccountFacade<H>;

	constructor(
		texchange: Texchange<H>,
	) {
		this.facade = texchange.getUserAccountFacade();
		this.spec = this.facade.spec;
		this.events = this.facade.events;
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
