import { CheckPoint } from '../timeline/time-engine';
export declare function makePeriodicCheckPoints(startTime: number, period: number, cb: () => void): Iterable<CheckPoint>;
