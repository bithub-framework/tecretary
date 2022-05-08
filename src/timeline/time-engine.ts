import {
	TimeEngineLike,
	TimeoutLike,
} from 'time-engine-like';
import {
	Sortque, Pointer,
	NoEnoughElem,
} from 'sortque';
import assert = require('assert');


export interface CheckPoint {
	time: number;
	cb: () => void;
}

class Timeout implements TimeoutLike {
	public constructor(
		private pointer: Pointer<CheckPoint>,
	) { }

	public clear(): void {
		this.pointer.remove();
	}
}

export class TimeEngine implements TimeEngineLike, IterableIterator<() => void> {
	private sortque: Sortque<CheckPoint>;

	public constructor(
		private time: number,
	) {
		this.sortque = new Sortque(
			(x1, x2) => x1.time < x2.time,
		);
	}

	public pushSortedCheckPoints(
		sorted: Iterator<CheckPoint>,
	): void {
		this.sortque.pushSorted(sorted);
		try {
			assert(this.sortque.getFront().time >= this.time);
		} catch (err) {
			assert(err instanceof NoEnoughElem);
		}
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
