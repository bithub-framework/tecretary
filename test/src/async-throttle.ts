export function asyncThrottle<F extends (...args: any[]) => Promise<void>>(
	f: F,
	interval: number,
): F {
	let lastTime = Number.NEGATIVE_INFINITY;
	let running: Promise<void> | null = null;
	return <F>(async (...args: any[]): Promise<void> => {
		if (Date.now() < lastTime + interval) return;
		if (running !== null) return running;
		return running = f();
	});
}
