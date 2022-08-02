import { TimeEngineLike } from 'time-engine-like';
export declare class Throttle {
    private interval;
    private engine;
    private lastTime;
    constructor(interval: number, engine: TimeEngineLike);
    invoke<Params extends unknown[], RType>(f: (...args: Params) => Promise<RType>): (...args: Params) => Promise<RType>;
}
