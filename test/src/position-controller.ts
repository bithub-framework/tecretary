import {
	ContextLike,
	HLike, H,
	Orderbook,
	Side, Length, Action,
	MarketEvents,
	AccountEvents,
} from 'secretary-like';
import {
	createStartable,
	ReadyState,
} from 'startable';
import assert = require('assert');
import { LatestSameAsGoal } from './auto-order';
import { GoalFollower } from './goal-follower';
import { once, EventEmitter } from 'events';
import { Mutex } from '@zimtsui/coroutine-locks';
// import { Throttle } from './throttle';


// disposable
export class PositionController<H extends HLike<H>>  {
	private latest?: H;
	private goal?: H;
	private follower: GoalFollower<H> | null = null;
	private broadcast = <BroadcastLike<H>>new EventEmitter();
	private switchingLock = new Mutex();

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

	private async swich(): Promise<void> {
		try {
			try {
				this.switchingLock.trylock();
			} catch (err) {
				return;
			}

			if (this.follower !== null) {
				await this.follower.$s.starp();
				this.latest = this.follower.getLatest();
				assert(
					this.$s.getReadyState() === ReadyState.STARTED,
					new Stopping(),
				);
			}
			const [orderbook] = <[Orderbook<H>]>await once(
				this.broadcast,
				'orderbook',
			);

			assert(
				this.$s.getReadyState() === ReadyState.STARTED,
				new Stopping(),
			);

			try {
				this.follower = new GoalFollower(
					orderbook,
					this.latest!,
					this.goal!,
					this.ctx,
				);
				this.follower.$s.start(this.$s.starp);
			} catch (err) {
				assert(err instanceof LatestSameAsGoal, <Error>err);
			} finally {
				this.switchingLock.unlock();
			}
		} catch (err) {
			assert(err instanceof Stopping, <Error>err);
		}
	}

	/**
	 * @throws Stopping
	 */
	public setGoal(goal: H.Source<H>): void {
		assert(
			this.$s.getReadyState() === ReadyState.STARTED,
			new Stopping(),
		);
		if (this.goal!.eq(goal)) return;
		this.goal = this.ctx.DataTypes.hFactory.from(goal);
		this.swich();
	}
}

interface Events<H extends HLike<H>>
	extends MarketEvents<H>, AccountEvents<H> { }

interface BroadcastLike<H extends HLike<H>> extends EventEmitter {
	on<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	once<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	off<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	emit<Event extends keyof Events<H>>(event: Event, ...args: Events<H>[Event]): boolean;
}

export class Stopping extends Error { }
