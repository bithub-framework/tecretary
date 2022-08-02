import { TimeEngineLike } from 'time-engine-like';


export class Throttle {
	private lastTime = Number.NEGATIVE_INFINITY;

	public constructor(
		private interval: number,
		private engine: TimeEngineLike,
	) { }

	public invoke<Params extends unknown[], RType>(
		f: (...args: Params) => Promise<RType>,
	): (...args: Params) => Promise<RType> {
		return async (...args: Params): Promise<RType> => {
			const time = this.lastTime + this.interval - this.engine.now();
			if (time > 0) await this.engine.sleep(time);
			this.lastTime = this.engine.now();
			return await f(...args);
		}
	}
}
