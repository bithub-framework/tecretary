import { CheckPoint } from '../timeline/time-engine';
import { Shifterator, Shiftable } from 'shiftable';


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
