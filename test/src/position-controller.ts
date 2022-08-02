import {
	ContextLike,
	HLike, H,
	Side, Length, Action,
} from 'secretary-like';
import {
	createStartable,
	ReadyState,
} from 'startable';
// import assert = require('assert');
import { GoalFollower } from './goal-follower';
import { Throttle } from './throttle';


// disposable
export class PositionController<H extends HLike<H>>  {
	private latest?: H;
	private goal?: H;
	private follower?: GoalFollower<H>;

	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	public constructor(
		private ctx: ContextLike<H>,
		private throttle: Throttle,
	) { }

	private async rawStart() {
		const positions = await this.throttle.invoke
			(this.ctx[0][0].getPositions)();
		this.goal = this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		this.follower = new GoalFollower(
			this.latest,
			this.ctx,
			this.throttle,
		);
	}

	private async rawStop() { }

	public async setGoal(goal: H.Source<H>) {
		this.goal = this.ctx.DataTypes.hFactory.from(goal);
		await this.follower!.$s.starp();
		await this.follower!.$s.start([this.goal], err => {
			if (err) this.$s.starp(err);
		});
	}
}
