export class Throttle {
	private time = Number.NEGATIVE_INFINITY;

	public constructor(
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
