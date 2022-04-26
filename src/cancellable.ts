import { ManualPromise } from 'manual-promise';
import {
	CheckPoint,
	TimeoutLike,
	TimeEngineLike,
} from './time-engine-like';


export class Cancellable extends ManualPromise {
	private timeout: TimeoutLike;
	public constructor(
		time: number,
		engine: TimeEngineLike,
	) {
		super();
		const checkPoint: CheckPoint = {
			time,
			cb: () => this.resolve(),
		};
		this.timeout = engine.setTimeout(checkPoint);
	}

	public cancel(err: Error): void {
		this.timeout.clear();
		this.reject(err);
	}
}
