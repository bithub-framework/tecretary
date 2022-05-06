import {
	TimeEngineLike,
	TimeoutLike,
} from 'time-engine-like';
import { Sortque, Removable } from 'sortque';
import assert = require('assert');


export interface CheckPoint {
	time: number;
	cb: () => void;
}

class Timeout implements TimeoutLike {
	public constructor(
		private pointer: Removable<CheckPoint>,
	) { }

	public clear(): void {
		this.pointer.remove();
	}
}

export class TimeEngine implements TimeEngineLike, IterableIterator<() => void> {
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

	public setTimeout(
		cb: () => void,
		ms: number,
	): TimeoutLike {
		const pointer = this.sortque.push({
			time: this.time + ms,
			cb,
		});
		return new Timeout(pointer);
	}

	public [Symbol.iterator]() {
		return this;
	}

	public next(): IteratorResult<() => void> {
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
