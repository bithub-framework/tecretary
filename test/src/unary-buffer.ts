import { Semaphore } from '@zimtsui/coroutine-locks';
import assert = require('assert');



export class UnaryBuffer<T> implements AsyncIterableIterator<T> {
	private lock = new Semaphore();
	private x?: T;
	private terminated = false;

	public push(x: T): void {
		try {
			this.tryShift();
		} catch { }
		this.x = x;
		this.lock.v();
	}

	private tryShift(): T {
		assert(!this.terminated, new Terminated());
		this.lock.tryp();
		return this.x!;
	}

	public terminate(): void {
		this.terminated = true;
		this.lock.throw(new Terminated());
	}

	private async shift(): Promise<T> {
		assert(!this.terminate, new Terminated());
		await this.lock.p();
		return this.x!;
	}

	public async next(): Promise<IteratorResult<T, void>> {
		try {
			return {
				done: false,
				value: await this.shift(),
			}
		} catch (err) {
			assert(err instanceof Terminated, <Error>err);
			return {
				done: true,
				value: void null,
			}
		}
	}

	public [Symbol.asyncIterator]() {
		return this;
	}
}

class Terminated extends Error { }
