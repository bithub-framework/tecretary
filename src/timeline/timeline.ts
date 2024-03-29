import { Rwlock } from '@zimtsui/coroutine-locks';
import { TimeEngine } from './time-engine';
import { TimeEngineLike } from 'time-engine-like';
import { Pollerloop, Loop } from 'pollerloop';
import { TimelineLike } from 'secretary-like';
import {
	createStartable,
	StateError,
	ReadyState,
} from 'startable';


export class Timeline extends TimeEngine implements TimelineLike {
	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	private lock = new Rwlock();
	private poller: Pollerloop;

	public constructor(
		startTime: number,
		pollerEngine: TimeEngineLike,
	) {
		super(startTime);

		this.poller = new Pollerloop(
			sleep => this.loop(sleep),
			pollerEngine,
		);
	}

	private async rawStart(): Promise<void> {
		await this.poller.$s.start(this.$s.stop)
	}

	private async rawStop(): Promise<void> {
		const p = this.poller.$s.stop();
		this.lock.throw(new StateError(
			'escape',
			ReadyState.STOPPING,
		));
		await p;
	}

	private loop: Loop = async sleep => {
		await this.lock.wrlock();
		await sleep(0);
		for (const cb of this) {
			cb();
			this.lock.unlock();
			await this.lock.wrlock();
			await sleep(0);
		}
	}

	public async escape<T>(p: PromiseLike<T>): Promise<T> {
		this.$s.assertReadyState('escape');
		await this.lock.rdlock();
		try {
			return await p;
		} finally {
			this.lock.unlock();
		}
	}
}
