import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	OpenOrder,
	HLike,
	Length, Side, Action,
	ContextLike,
	Positions,
	LimitOrder,
	Orderbook,
} from 'secretary-like';
import assert = require('assert');
import { Throttle } from './throttle';


// disposable
export class AutoOrder<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);

	private openOrder?: OpenOrder<H>;
	private limitOrder: LimitOrder<H>;

	public constructor(
		orderbook: Orderbook<H>,
		private latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
		private throttle: Throttle,
	) {
		const price = this.latest.lt(this.goal)
			? orderbook[Side.ASK][0].price.minus(this.ctx[0].TICK_SIZE)
			: orderbook[Side.BID][0].price.plus(this.ctx[0].TICK_SIZE);
		const quantity = this.goal.minus(this.latest).abs();
		const side = this.latest.lt(this.goal) ? Side.BID : Side.ASK;
		const action = Action.CLOSE;
		const length = Length.from(side, action);
		this.limitOrder = this.ctx.DataTypes.limitOrderFactory.create({
			price, quantity, side, action, length,
		});
		if (this.limitOrder.side === Side.BID)
			this.goal = latest.plus(this.limitOrder.quantity);
		else
			this.goal = latest.minus(this.limitOrder.quantity);
	}

	private onPositions = (positions: Positions<H>) => {
		this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		if (this.latest.eq(this.goal)) this.$s.starp();
	}

	private onOrderbook = (orderbook: Orderbook<H>) => {
		if (
			this.limitOrder!.side === Side.BID &&
			orderbook[Side.BID][0].price.gt(this.limitOrder!.price)
			||
			this.limitOrder!.side === Side.ASK &&
			orderbook[Side.ASK][0].price.lt(this.limitOrder!.price)
		) this.$s.starp(new OrderbookMoving());
	}

	private async rawStart(
	) {
		const [openOrder] = await this.throttle.invoke
			(this.ctx[0][0].makeOrders)([this.limitOrder]);
		assert(!(openOrder instanceof Error), <Error>openOrder);
		this.openOrder = openOrder;
		this.ctx[0][0].on('positions', this.onPositions);
		this.ctx[0].on('orderbook', this.onOrderbook);
	}

	private async rawStop(err?: Error) {
		this.ctx[0].off('orderbook', this.onOrderbook);
		this.ctx[0][0].off('positions', this.onPositions);
		if (err instanceof OrderbookMoving) {
			[this.openOrder] = await this.throttle.invoke
				(this.ctx[0][0].cancelOrders)([
					this.openOrder!,
				]);
			this.latest = this.openOrder.side === Side.BID
				? this.goal.minus(this.openOrder.unfilled)
				: this.goal.plus(this.openOrder.unfilled);
		}
	}

	public getLatest(): H {
		assert(this.$s.getReadyState() === ReadyState.STOPPED);
		return this.latest;
	}
}

export class OrderbookMoving extends Error { }
