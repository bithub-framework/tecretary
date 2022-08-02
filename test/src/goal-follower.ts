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
// import assert = require('assert');
import { Throttle } from './throttle';


const nodeTimeEngine = new NodeTimeEngine();

// recyclable
export class GoalFollower<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private autoOrder?: AutoOrder<H>; // STARTED STOPPING
	private goal: H;

	public constructor(
		private latest: H,
		private ctx: ContextLike<H>,
		private throttle: Throttle,
	) {
		this.goal = latest;
	}

	private onOrderbook = async (orderbook: Orderbook<H>) => {
		try {
			this.autoOrder = new AutoOrder(
				orderbook,
				this.latest,
				this.goal,
				this.ctx,
				this.throttle,
			);

			await this.autoOrder!.$s.start([], async err => {
				try {
					await this.autoOrder!.$s.stop();
					this.latest = this.autoOrder!.getLatest();
					if (this.latest.eq(this.goal)) this.$s.starp();
					else if (err instanceof OrderbookMoving) {
						if (this.$s.getReadyState() !== ReadyState.STOPPING)
							this.ctx[0].once('orderbook', this.onOrderbook);
					} else this.$s.starp();
				} catch (err) {
					this.$s.starp(<Error>err);
				}
			});
		} catch (err) {
			this.$s.starp(<Error>err);
		}
	}

	private async rawStart(goal: H) {
		this.goal = goal;
		this.ctx[0].once('orderbook', this.onOrderbook);
	}

	private async rawStop() {
		this.ctx[0].off('orderbook', this.onOrderbook);
		if (this.autoOrder)
			await this.autoOrder.$s.starp();
	}

	public getLatest(): H {
		return this.latest;
	}
}
