import {
	ContextLike,
	HLike,
	Trade,
	Orderbook,
	Side, Length, Action,
	LimitOrder,
} from 'secretary-like';
import {
	createStartable,
	ReadyState,
} from 'startable';
import assert = require('assert');
import { StartableOrder } from './startable-order';
import { once } from 'events';



export class PositionController<H extends HLike<H>>  {
	private nextGoal?: H;
	private order?: StartableOrder<H>;
	private orderbook?: Orderbook<H>;
	private lastRequestTime = Number.NEGATIVE_INFINITY;

	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	public constructor(
		private ctx: ContextLike<H>,
		private interval: number,
	) { }

	private onOrderbook = async (orderbook: Orderbook<H>) => {
		try {
			this.orderbook = orderbook;
			if (this.shouldRemake())
				await this.tryRemake();
		} catch (err) {
			console.error(err);
		}
	}

	private shouldRemake(): boolean {
		if (
			this.$s.getReadyState() === ReadyState.STARTING ||
			this.$s.getReadyState() === ReadyState.STOPPING
		) return false;

		if (this.nextGoal!.neq(this.order!.getGoal())) return true;

		if (this.order!.$s.getReadyState() === ReadyState.STARTED) {
			const limitOrder = this.order!.getLimitOrder();
			if (
				limitOrder.price.eq(
					this.orderbook![Side.invert(limitOrder.side)][0].price.minus(
						this.ctx[0].TICK_SIZE.times(
							limitOrder.side === Side.BID ? 1 : -1,
						),
					),
				)
			) return false;
		}

		if (
			this.order!.$s.getReadyState() === ReadyState.STOPPED &&
			this.order!.getLatest() === this.order!.getGoal()
		) return false;

		return true;
	}

	private async tryRemake() {
		const now = Date.now();
		if (now < this.lastRequestTime + this.interval) return;
		if (this.order!.$s.getReadyState() === ReadyState.STARTED) {
			this.lastRequestTime = now;
			await this.order!.$s.stop();
		} else if (this.order!.$s.getReadyState() === ReadyState.STOPPED) {
			this.lastRequestTime = now;
			await this.remake();
		}
	}

	private async remake() {
		const side = this.order!.getLatest().lt(this.nextGoal!) ? Side.BID : Side.ASK;
		const length = Length.from(side, Action.CLOSE);
		const price = this.orderbook![Side.invert(side)][0].price.minus(
			this.ctx[0].TICK_SIZE.times(
				side === Side.BID ? 1 : -1,
			),
		);
		const quantity = this.nextGoal!.minus(this.order!.getLatest()).abs();
		const source: LimitOrder.Source<H> = {
			side,
			action: Action.CLOSE,
			length,
			price,
			quantity,
		}

		await this.order!.$s.start([
			source,
			this.order!.getLatest(),
			this.nextGoal!,
		]);
	}

	private async rawStart() {
		const positions = await this.ctx[0][0].getPositions();
		const latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		const goal = latest;
		this.nextGoal = latest;
		this.order = new StartableOrder(
			latest,
			goal,
			this.ctx,
		);
		this.ctx[0].on('orderbook', this.onOrderbook);
		await once(this.ctx[0], 'orderbook');
	}

	private async rawStop() {
		this.ctx[0].off('orderbook', this.onOrderbook);
	}

	public async setGoal(nextGoal: H) {
		this.nextGoal = nextGoal;
	}
}
