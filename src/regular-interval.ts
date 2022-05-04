import { CheckPoint } from 'timeline';


export function* regularInverval(
	startTime: number,
	wait: number,
	cb: () => void,
): Generator<CheckPoint, void> {
	for (let time = startTime; ; time += wait)
		yield {
			cb,
			time,
		};
}
