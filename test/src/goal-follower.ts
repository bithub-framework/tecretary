import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	HLike,
	ContextLike,
	Orderbook,
	Length, Side, Action,
	MarketEventEmitterLike,
} from 'secretary-like';
import {
	AutoOrder,
	OrderbookMoving,
} from './auto-order';
import { NodeTimeEngine } from 'node-time-engine';
import { Pollerloop, Loop } from 'pollerloop';
import assert = require('assert');
import { once, EventEmitter } from 'events';
// import { Throttle } from './throttle';


const nodeTimeEngine = new NodeTimeEngine();

// disposable
export class GoalFollower<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private autoOrder: AutoOrder<H>;
	private poller: Pollerloop;
	private broadcast = <MarketEventEmitterLike<H>>new EventEmitter();

	public constructor(
		orderbook: Orderbook<H>,
		latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
		// private throttle: Throttle,
	) {
		assert(latest.neq(goal));
		this.autoOrder = new AutoOrder(
			orderbook,
			latest,
			goal,
			ctx,
		);
		this.poller = new Pollerloop(
			this.loop,
			nodeTimeEngine,
		);
	}

	private loop: Loop = async sleep => {
		try {
			for (; ;) {
				await this.autoOrder.$s.start();
				try {
					await this.autoOrder.$s.getRunningPromise();
					await this.autoOrder.$s.stop();
					break;
				} catch (err) {
					assert(err instanceof OrderbookMoving, <Error>err);
					await this.autoOrder.$s.stop();
					const [orderbook] = await once(
						this.broadcast,
						'orderbook',
					);
					this.autoOrder = new AutoOrder(
						orderbook,
						this.autoOrder.getLatest(),
						this.goal,
						this.ctx,
					);
				}
			}
		} catch (err) {
			assert(err instanceof Stopping, <Error>err);
		}
	}

	private onOrderbook = (orderbook: Orderbook<H>) => {
		this.broadcast.emit('orderbook', orderbook);
	}

	private async rawStart() {
		this.ctx[0].on('orderbook', this.onOrderbook);
		await this.poller.$s.start(this.$s.starp);
	}

	private async rawStop() {
		this.broadcast.emit('error', new Stopping());
		await this.autoOrder.$s.starp();
		await this.poller.$s.stop();
		this.ctx[0].off('orderbook', this.onOrderbook);
	}

	public getLatest(): H {
		return this.autoOrder.getLatest();
	}
}

class Stopping extends Error { }
