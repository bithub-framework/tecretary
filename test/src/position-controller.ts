import {
	ContextLike,
	HLike, H,
	Side, Length, Action,
} from 'secretary-like';
import {
	createStartable,
	ReadyState,
} from 'startable';
import assert = require('assert');
import { GoalFollower } from './goal-follower';


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
	) { }

	private async rawStart() {
		const positions = await this.ctx[0][0].getPositions();
		this.goal = this.latest = positions.position[Length.LONG]
			.minus(positions.position[Length.SHORT]);
		this.follower = new GoalFollower(
			this.latest,
			this.goal,
			this.ctx,
		);
		this.follower.$s.start(this.$s.starp);
	}

	private async rawStop() {
		if (this.follower)
			await this.follower.$s.starp();
	}

	public setGoal(goal: H.Source<H>): void {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		(async () => {
			this.goal = this.ctx.DataTypes.hFactory.from(goal);
			try {
				this.follower!.setGoal(this.goal);
			} catch (err) {
				await this.follower!.$s.starp();
				this.latest = this.follower!.getLatest();
				if (this.$s.getReadyState() !== ReadyState.STARTED) return;
				this.follower = new GoalFollower(
					this.latest,
					this.goal,
					this.ctx,
				);
				this.follower.$s.start(this.$s.starp).catch(this.$s.starp);;
			}
		})();
	}
}
