import { CheckPoint } from './check-point';


export function cmp(cp1: CheckPoint, cp2: CheckPoint) {
	return cp1.time - cp2.time;
}
