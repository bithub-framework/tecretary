import { Rwlock } from '@zimtsui/coroutine-locks';
import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { Pollerloop, Sleep, LoopStopped } from 'pollerloop';
import { TimelineLike } from 'secretary-like';
import { Startable } from 'startable';


export class Timeline extends TimeEngine implements TimelineLike {
	private lock = new Rwlock();
	private poller: Pollerloop;
	public startable = Startable.create(
		() => this.start(),
		() => this.stop(),
	);

	public constructor(
		time: number,
		pollerEngine: TimeEngineLike,
	) {
		super(time);

		this.poller = new Pollerloop(
			sleep => this.loop(sleep),
			pollerEngine,
		);
	}

	private async start(): Promise<void> {
		await this.poller.startable.start(this.startable.starp)
	}

	private async stop(): Promise<void> {
		const p = this.poller.startable.stop();
		this.lock.throw(new LoopStopped('Loop stopped.'));
		await p;
	}

	private async loop(sleep: Sleep) {
		await this.lock.wrlock();
		await sleep(0);
		for (const cb of this) {
			cb();
			this.lock.unlock();
			await this.lock.wrlock();
			await sleep(0);
		}
	}

	public sleep(ms: number): Cancellable {
		return new Cancellable(
			ms,
			this,
		);
	}

	public async escape<T>(p: PromiseLike<T>): Promise<T> {
		await this.lock.rdlock();
		try {
			return await p;
		} finally {
			this.lock.unlock();
		}
	}
}
