import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	HLike,
	ContextLike,
	Orderbook,
	Length, Side, Action,
} from 'secretary-like';
import {
	AutoOrder,
	OrderbookMoving,
} from './auto-order';
import {
	Pollerloop,
	Loop,
} from 'pollerloop';
import { NodeTimeEngine } from 'node-time-engine';
import { once } from 'events';
// import assert = require('assert');
import { Throttle } from './throttle';


const nodeTimeEngine = new NodeTimeEngine();

// recyclable
export class GoalFollower<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private pollerloop: Pollerloop;
	private autoOrder?: AutoOrder<H>; // STARTED STOPPING
	private goal: H;

	public constructor(
		private latest: H,
		private ctx: ContextLike<H>,
		private throttle: Throttle,
	) {
		this.goal = latest;
		this.pollerloop = new Pollerloop(this.loop, nodeTimeEngine);
	}

	private loop: Loop = async sleep => {
		for (; ;) {
			await sleep(0);
			const [orderbook] = <[Orderbook<H>]>await once(this.ctx[0], 'orderbook');
			await sleep(0);

			this.autoOrder = new AutoOrder(
				orderbook,
				this.latest,
				this.goal,
				this.ctx,
				this.throttle,
			);

			try {
				await new Promise<void>((resolve, reject) => {
					this.autoOrder!.$s.start([], async err => {
						try {
							await this.autoOrder!.$s.stop();
							this.latest = this.autoOrder!.getLatest();
							if (this.latest.eq(this.goal)) resolve();
							else if (err instanceof OrderbookMoving) reject(err);
							else resolve();
						} catch (err) {
							console.error(err);
						}
					});
				});
				return;
			} catch (err) { }
		}
	}

	private async rawStart(goal: H) {
		this.goal = goal;
		await this.pollerloop.$s.start([], this.$s.starp);
	}

	private async rawStop() {
		if (this.autoOrder)
			await this.autoOrder.$s.starp();
		await this.pollerloop.$s.stop();
	}

	public getLatest(): H {
		return this.latest;
	}
}
