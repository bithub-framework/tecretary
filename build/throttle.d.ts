export declare class Throttle {
    private time;
    private wait;
    private cb;
    constructor(time: number, wait: number, cb: () => void);
    call(now: number): void;
}
