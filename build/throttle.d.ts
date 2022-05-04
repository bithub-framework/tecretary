export declare class Throttle {
    private wait;
    private cb;
    private time;
    constructor(wait: number, cb: () => void);
    call(now: number): void;
}
