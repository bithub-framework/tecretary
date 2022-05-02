import {
	TimeEngineLike,
	TimeoutLike,
	Callback,
} from 'cancellable';
import { Sortque, Removable } from 'sortque';
import assert = require('assert');

export { Callback }
export interface CheckPoint {
	time: number;
	cb: Callback;
}

class Timeout implements TimeoutLike {
	public constructor(
		private pointer: Removable<CheckPoint>,
	) { }

	public clear(): void {
		this.pointer.remove();
	}
}

export class TimeEngine implements TimeEngineLike, IterableIterator<Callback> {
	private sortque: Sortque<CheckPoint>;

	public constructor(
		private time: number,
		sortedInitialCheckPoints: Iterator<CheckPoint> = [][Symbol.iterator](),
	) {
		this.sortque = new Sortque(
			sortedInitialCheckPoints,
			(a, b) => a.time - b.time,
		);
		assert(this.sortque.getFront().time >= this.time);
	}

	public setTimeout(cb: Callback, ms: number): TimeoutLike {
		const pointer = this.sortque.push({
			time: this.time + ms,
			cb,
		});
		return new Timeout(pointer);
	}

	public [Symbol.iterator]() {
		return this;
	}

	public next(): IteratorResult<Callback> {
		try {
			const checkPoint = this.sortque.shift();
			this.time = checkPoint.time;
			return {
				done: false,
				value: checkPoint.cb,
			};
		} catch (err) {
			return {
				done: true,
				value: void null,
			}
		}
	}

	public now(): number {
		return this.time;
	}
}

export { TimeoutLike }
