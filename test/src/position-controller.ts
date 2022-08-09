import {
	ContextLike,
	HLike, H,
	Orderbook,
	Side, Length, Action,
	MarketEventEmitterLike,
} from 'secretary-like';
import {
	createStartable,
	ReadyState,
} from 'startable';
import assert = require('assert');
import { GoalFollower } from './goal-follower';
import { once, EventEmitter } from 'events';
import { Throttle } from './throttle';


// disposable
export class PositionController<H extends HLike<H>>  {
	private latest?: H;
	private goal?: H;
	private follower: GoalFollower<H> | null = null;
	private broadcast = <MarketEventEmitterLike<H>>new EventEmitter();

	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	public constructor(
		private ctx: ContextLike<H>,
		// private throttle: Throttle,
	) { }

	private onOrderbook = (orderbook: Orderbook<H>) => {
		this.broadcast.emit('orderbook', orderbook);
	}

	private async rawStart() {
		this.ctx[0].on('orderbook', this.onOrderbook);
		const positions = await this.ctx[0][0].getPositions();
		this.goal = this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
	}

	private async rawStop() {
		if (this.follower !== null)
			await this.follower.$s.starp();
		this.ctx[0].off('orderbook', this.onOrderbook);
	}

	public async setGoal(goal: H.Source<H>) {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		if (this.follower !== null) {
			await this.follower.$s.starp();
			this.latest = this.follower.getLatest();
			if (this.$s.getReadyState() !== ReadyState.STARTED) return;
		}
		const [orderbook] = <[Orderbook<H>]>await once(
			this.broadcast,
			'orderbook',
		);

		if (this.$s.getReadyState() !== ReadyState.STARTED) return;

		this.goal = this.ctx.DataTypes.hFactory.from(goal);
		this.follower = new GoalFollower(
			orderbook,
			this.latest!,
			this.goal,
			this.ctx,
		);
		this.follower.$s.start(this.$s.starp);
	}
}
