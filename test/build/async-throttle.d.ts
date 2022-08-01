export declare function asyncThrottle<F extends (...args: any[]) => Promise<void>>(f: F, interval: number): F;
