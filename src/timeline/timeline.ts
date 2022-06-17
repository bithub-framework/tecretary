import { Rwlock } from '@zimtsui/coroutine-locks';
import { TimeEngine } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { Pollerloop, Sleep, LoopStopped } from 'pollerloop';
import { TimelineLike } from 'secretary-like';
import { Startable, StartableLike } from 'startable';


export class Timeline extends TimeEngine implements TimelineLike, StartableLike {
	private startable = Startable.create(
		() => this.rawStart(),
		() => this.rawStop(),
	);
	public start = this.startable.start;
	public stop = this.startable.stop;
	public assart = this.startable.assart;
	public starp = this.startable.starp;
	public getReadyState = this.startable.getReadyState;
	public skipStart = this.startable.skipStart;

	private lock = new Rwlock();
	private poller: Pollerloop;

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

	private async rawStart(): Promise<void> {
		await this.poller.startable.start(this.startable.starp)
	}

	private async rawStop(): Promise<void> {
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
