import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	HLike,
	ContextLike,
	Length, Side, Action,
} from 'secretary-like';
import { AutoOrder } from './auto-order';
import { NodeTimeEngine } from 'node-time-engine';
import { Pollerloop, Loop } from 'pollerloop';
import assert = require('assert');


const nodeTimeEngine = new NodeTimeEngine();

// disposable
export class GoalFollower<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private autoOrder?: AutoOrder<H>;
	private poller: Pollerloop;

	public constructor(
		private latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
	) {
		this.poller = new Pollerloop(
			this.loop,
			nodeTimeEngine,
		);
	}

	private loop: Loop = async sleep => {
		for (
			await sleep(0);
			this.latest.neq(this.goal);
			await sleep(0)
		) {
			this.autoOrder = new AutoOrder(
				this.latest,
				this.goal,
				this.ctx,
			);
			try {
				await this.autoOrder.$s.start();
				await this.autoOrder.$s.getRunningPromise().then(() => { }, () => { });
			} finally {
				await this.autoOrder.$s.stop();
				this.latest = this.autoOrder.getLatest();
			}
		}
	}

	private async rawStart() {
		await this.poller.$s.start(this.$s.starp);
	}

	private async rawStop() {
		if (this.autoOrder)
			await this.autoOrder.$s.starp();
		await this.poller.$s.starp();
	}

	public getLatest(): H {
		assert(this.$s.getReadyState() === ReadyState.STOPPED);
		return this.latest;
	}

	public setGoal(goal: H) {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		this.goal = goal;
	}
}
