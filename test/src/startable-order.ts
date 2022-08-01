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
} from 'secretary-like';
import assert = require('assert');



export class StartableOrder<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);

	private openOrder?: OpenOrder<H>;
	private limitOrder?: LimitOrder<H>;

	public constructor(
		private latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
	) {
		assert(latest.eq(goal));
	}

	private onPositions = (positions: Positions<H>) => {
		this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		if (this.latest.eq(this.goal)) this.$s.starp(new Fulfilled());
	}

	private async rawStart(
		source: LimitOrder.Source<H>,
		latest: H,
		goal: H,
	) {
		assert(latest.neq(goal));
		const limitOrder = this.ctx.DataTypes.limitOrderFactory.create(source);
		assert(
			limitOrder.quantity.times(
				source.side === Side.BID ? 1 : -1
			).eq(goal.minus(latest)),
		);
		this.limitOrder = limitOrder;
		this.latest = latest;
		this.goal = goal;

		const [order] = await this.ctx[0][0].makeOrders([source]);
		assert(!(order instanceof Error), <Error>order);
		this.openOrder = order;
		this.ctx[0][0].on('positions', this.onPositions);
	}

	private async rawStop(err?: Error) {
		this.ctx[0][0].off('positions', this.onPositions);
		if (err instanceof Fulfilled) return;
		const [cancelled] = await this.ctx[0][0].cancelOrders([
			this.getInitialOpenOrder(),
		]);
		this.latest = this.goal.minus(
			cancelled.unfilled.times(
				cancelled.side === Side.BID ? 1 : -1,
			),
		);
	}

	public getLatest(): H {
		assert(this.$s.getReadyState() === ReadyState.STOPPED);
		return this.latest;
	}

	public getGoal(): H {
		return this.goal;
	}

	public getLimitOrder(): LimitOrder<H> {
		assert(this.$s.getReadyState() !== ReadyState.STOPPED);
		return this.limitOrder!;
	}

	private getInitialOpenOrder(): OpenOrder<H> {
		assert(
			this.$s.getReadyState() === ReadyState.STARTED ||
			this.$s.getReadyState() === ReadyState.STOPPING
		);
		return this.openOrder!;
	}
}

export class Fulfilled extends Error { }
