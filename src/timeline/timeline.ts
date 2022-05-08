import { Rwlock } from 'coroutine-locks';
import { TimeEngine, CheckPoint } from './time-engine';
import { Cancellable } from 'cancellable';
import { TimeEngineLike } from 'time-engine-like';
import { Pollerloop, Sleep, LoopStopped } from 'pollerloop';
import { TimelineLike } from 'secretary-like';
import { Startable } from 'startable';



export class Timeline implements TimelineLike {
	private engine: TimeEngine;
	private lock = new Rwlock();
	private poller: Pollerloop;
	public startable = new Startable(
		() => this.start(),
		() => this.stop(),
	);

	public constructor(
		startTime: number,
		pollerEngine: TimeEngineLike,
		private prehook: () => void = () => { },
		private posthook: () => void = () => { },
	) {
		this.engine = new TimeEngine(
			startTime,
		);

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

	public pushSortedCheckPoints(
		sorted: Iterator<CheckPoint>,
	): void {
		this.engine.pushSortedCheckPoints(sorted);
	}

	private async loop(sleep: Sleep) {
		await this.lock.wrlock();
		await sleep(0);
		for (const cb of this.engine) {
			this.prehook();
			cb();
			this.lock.unlock();
			await this.lock.wrlock();
			await sleep(0);
			this.posthook();
		}
	}

	public now(): number {
		return this.engine.now();
	}

	public sleep(ms: number): Cancellable {
		return new Cancellable(
			ms,
			this.engine,
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
