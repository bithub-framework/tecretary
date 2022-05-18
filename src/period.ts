import { Startable, ReadyState } from 'startable';
import { TimelineLike } from 'secretary-like';


export class Period {
	public startable = new Startable(
		() => this.start(),
		() => this.stop(),
	);
	private onTimeout = () => {
		this.cb();
		if (this.startable.getReadyState() === ReadyState.STARTED)
			this.timeline.sleep(this.ms).then(this.onTimeout);
	}

	public constructor(
		private timeline: TimelineLike,
		private ms: number,
		private cb: () => void,
	) { }

	private async start() {
		this.timeline.sleep(this.ms).then(this.onTimeout);
	}
	private async stop() { }
}
