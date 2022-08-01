import {
	ContextLike,
	HLike,
	Trade,
	Orderbook,
	Side, Length, Action,
	Positions,
	OpenOrder,
	LimitOrder,
} from 'secretary-like';
import {
	StartableLike,
	createStartable,
	ReadyState,
} from 'startable';
import assert = require('assert');
import { StartableOrder } from './startable-order';
import { throttle } from 'lodash';



export class PositionController<H extends HLike<H>> implements StartableLike {
	private nextGoal?: H;
	private order?: StartableOrder<H>;

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

	public constructor(
		private ctx: ContextLike<H>,
		private interval: number,
	) { }

	private onOrderbook = async (orderbook: Orderbook<H>) => {
		try {
			if (
				this.order!.getReadyState() === ReadyState.STARTING ||
				this.order!.getReadyState() === ReadyState.STOPPING
			) return;

			if (this.nextGoal!.neq(this.order!.getGoal())) {
				await this.throttledTrySwitch(orderbook);
				return;
			}

			const order = this.order!.getLimitOrder();
			if (
				this.order!.getReadyState() === ReadyState.STARTED &&
				order.price.eq(
					orderbook[Side.invert(order.side)][0].price.minus(
						this.ctx[0].TICK_SIZE.times(
							order.side === Side.BID ? 1 : -1,
						),
					),
				)
			) return;

			if (
				this.order!.getReadyState() === ReadyState.STOPPED &&
				this.order!.getLatest() === this.order!.getGoal()
			) return;

			await this.throttledTrySwitch(orderbook);
		} catch (err) {
			console.error(err);
		}
	}

	private async switchOn(orderbook: Orderbook<H>) {
		assert(this.order!.getReadyState() === ReadyState.STOPPED);

		const side = this.order!.getLatest().lt(this.nextGoal!) ? Side.BID : Side.ASK;
		const length = Length.from(side, Action.CLOSE);
		const price = orderbook[Side.invert(side)][0].price.minus(
			this.ctx[0].TICK_SIZE.times(
				side === Side.BID ? 1 : -1,
			),
		);
		const quantity = this.nextGoal!.minus(this.order!.getLatest()).abs();
		const order: LimitOrder.Source<H> = {
			side,
			action: Action.CLOSE,
			length,
			price,
			quantity,
		}

		this.order = new StartableOrder(
			order,
			this.order!.getLatest(),
			this.nextGoal!,
			this.ctx,
		);
		await this.order.start();
	}

	private async switchOff(orderbook: Orderbook<H>) {
		assert(this.order!.getReadyState() !== ReadyState.STOPPED);
		await this.order!.stop();
	}

	private trySwitch = async (orderbook: Orderbook<H>) => {
		try {
			await this.switchOn(orderbook);
		} catch (err) {
			await this.switchOff(orderbook);
		}
	}
	private throttledTrySwitch = throttle(this.trySwitch, this.interval);

	private async rawStart() {
		const positions = await this.ctx[0][0].getPositions();
		const latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		const goal = latest;
		this.nextGoal = latest;
		this.order = new StartableOrder(
			{
				price: 0,
				quantity: 0,
				side: Side.BID,
				action: Action.CLOSE,
				length: Length.LONG,
			},
			latest,
			goal,
			this.ctx,
		);
		this.ctx[0].on('orderbook', this.onOrderbook);
	}

	private async rawStop() {
		this.ctx[0].off('orderbook', this.onOrderbook);
	}

	public async setGoal(nextGoal: H) {
		this.nextGoal = nextGoal;
	}
}
