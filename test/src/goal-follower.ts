import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	HLike, H,
	ContextLike,
	Length, Side, Action,
} from 'secretary-like';
import { AutoOrder } from './auto-order';
import { nodeTimeEngine } from 'node-time-engine';
import { Pollerloop, Loop } from 'pollerloop';
import { UnaryBuffer } from './unary-buffer';
import assert = require('assert');



export class GoalFollower<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private autoOrder?: AutoOrder<H>;
	private poller: Pollerloop;
	private latest?: H;
	private goalBuffer = new UnaryBuffer<H>();

	public constructor(
		private ctx: ContextLike<H>,
	) {
		this.poller = new Pollerloop(
			this.loop,
			nodeTimeEngine,
		);
	}

	private loop: Loop = async sleep => {
		for await (const goal of this.goalBuffer) {
			// TODO
			// await sleep(0);
			if (goal.eq(this.latest!)) continue;
			this.autoOrder = new AutoOrder(
				this.latest!,
				goal,
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
		await this.ctx.$s.assart(this.$s.starp);

		const positions = await this.ctx[0][0].getPositions();
		this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);

		await this.poller.$s.start(err => {
			if (err instanceof Stopping) this.$s.starp();
			else this.$s.starp(err);
		});
	}

	private async rawStop() {
		if (this.autoOrder)
			await this.autoOrder.$s.starp();
		this.goalBuffer.terminate(new Stopping());
		await this.poller.$s.starp();
	}

	public getLatest(): H {
		this.$s.assertReadyState('getLatest', [
			ReadyState.STARTED,
			ReadyState.STOPPING,
			ReadyState.STOPPED,
		]);
		if (this.autoOrder)
			this.latest = this.autoOrder.getLatest();
		return this.latest!;
	}

	public setGoal(goal: H.Source<H>) {
		this.$s.assertReadyState('setGoal');
		this.goalBuffer.push(
			this.ctx.DataTypes.hFactory.from(goal),
		);
	}
}

class Stopping extends Error { }
