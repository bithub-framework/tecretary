import {
	StartableLike,
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
} from 'secretary-like';
import assert = require('assert');



export class StartableOrder<H extends HLike<H>> implements StartableLike {
	private startable = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);
	public start = this.startable.start;
	public stop = this.startable.stop;
	public assart = this.startable.assart;
	public starp = this.startable.starp;
	public getReadyState = this.startable.getReadyState;
	public skipStart = this.startable.skipStart;

	private openOrder: OpenOrder<H> | null = null;
	private limitOrder: LimitOrder<H>;

	public constructor(
		source: LimitOrder.Source<H>,
		private latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
	) {
		this.limitOrder = this.ctx.DataTypes.limitOrderFactory.create(source);
		assert(latest.neq(goal));
		assert(
			this.limitOrder.quantity.times(
				source.side === Side.BID ? 1 : -1
			).eq(goal.minus(latest)),
		);
	}

	private onPositions = (positions: Positions<H>) => {
		this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		if (this.latest.eq(this.goal)) this.stop(new Fulfilled());
	}

	private async rawStart() {
		const [order] = await this.ctx[0][0].makeOrders([this.limitOrder]);
		assert(!(order instanceof Error), <Error>order);
		this.openOrder = order;
		this.ctx[0][0].on('positions', this.onPositions);
	}

	private async rawStop(err?: Error) {
		this.ctx[0][0].off('positions', this.onPositions);
		if (err instanceof Fulfilled) return;
		[this.openOrder] = await this.ctx[0][0].cancelOrders([this.openOrder!]);
		this.latest = this.goal.minus(
			this.openOrder.unfilled.times(
				this.openOrder.side === Side.BID ? 1 : -1,
			),
		);
	}

	public getLatest(): H {
		assert(this.getReadyState() === ReadyState.STOPPED);
		return this.latest;
	}

	public getGoal(): H {
		return this.goal;
	}

	public getLimitOrder(): LimitOrder<H> {
		return this.limitOrder;
	}
}

export class Fulfilled extends Error { }
