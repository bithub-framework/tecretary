import {
	TimeEngineLike,
	CheckPoint,
	TimeoutLike,
	Callback,
} from './time-engine-like';
import { Sortque } from 'sortque';
import assert = require('assert');


class Timeout implements TimeoutLike {
	public constructor(
		private pointer: Sortque.Pointer<CheckPoint>,
	) { }

	public clear(): void {
		this.pointer.remove();
	}
}

export class TimeEngine implements TimeEngineLike {
	private sortque = new Sortque<CheckPoint>();
	public constructor(
		public time: number,
	) { }

	public setTimeout(checkPoint: CheckPoint): TimeoutLike {
		assert(checkPoint.time >= this.time);
		const pointer = this.sortque.push(checkPoint);
		return new Timeout(pointer);
	}

	public next(): IteratorResult<Callback> {
		const checkPoint = this.sortque.shift();
		this.time = checkPoint.time;
		return {
			done: false,
			value: checkPoint.cb,
		};
	}

	public now(): number {
		return this.time;
	}
}

export { TimeoutLike }
