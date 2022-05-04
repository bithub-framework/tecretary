export class Throttle {
	public constructor(
		private time: number,
		private wait: number,
		private cb: () => void,
	) { }

	public call(now: number): void {
		if (now >= this.time + this.wait) {
			this.time = now;
			this.cb();
		}
	}
}
