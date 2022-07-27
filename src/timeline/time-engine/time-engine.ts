import {
	TimeEngineLike,
	TimeoutLike,
} from 'time-engine-like';
import { Heap, Node } from '@zimtsui/binary-heap';
import {
	Affiliation,
	Merged,
	Shiftable,
} from 'shiftable';
import assert = require('assert');
import { CheckPoint } from './check-point';
import { cmp } from './cmp';



interface ShiftableHeap<T> extends Heap<T>, Shiftable<T> { }

export class Timeout implements TimeoutLike {
	public constructor(
		private node: Node<CheckPoint>,
	) { }

	public clear(): void {
		this.node.remove();
	}
}


export class TimeEngine implements TimeEngineLike, Iterable<() => void> {
	private heap = <ShiftableHeap<CheckPoint>>new Heap(cmp);
	private checkPoints: Shiftable<CheckPoint> = this.heap;
	private sorted = true;

	public constructor(
		private time: number,
	) { }

	public merge(sorted: Shiftable<CheckPoint>): void {
		assert(this.sorted);
		this.checkPoints = new Merged(
			cmp,
			this.checkPoints,
			sorted,
		);
	}

	public affiliate(sorted: Shiftable<CheckPoint>): void {
		assert(this.sorted);
		this.checkPoints = new Affiliation(
			cmp,
			this.checkPoints,
			sorted,
		);
	}

	public setTimeout(
		cb: () => void,
		ms: number,
	): TimeoutLike {
		const checkPoint: CheckPoint = {
			time: this.time + ms,
			cb,
		};
		const pointer = this.heap.push(checkPoint);
		return new Timeout(pointer);
	}

	public *[Symbol.iterator]() {
		try {
			for (; ;) {
				const checkPoint = this.checkPoints.shift();
				this.time = checkPoint.time;
				yield checkPoint.cb;
			}
		} catch (err) {
			assert(err instanceof RangeError);
		}
	}

	public now(): number {
		return this.time;
	}
}
