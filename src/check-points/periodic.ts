import { CheckPoint } from '../timeline/time-engine';


export function* makePeriodicCheckPoints(
	startTime: number,
	period: number,
	cb: () => void,
): Iterable<CheckPoint> {
	for (let time = startTime; ; time += period)
		yield {
			time,
			cb,
		};
}
