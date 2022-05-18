import { Startable } from 'startable';
import { TimelineLike } from 'secretary-like';
export declare class Period {
    private timeline;
    private ms;
    private cb;
    startable: Startable;
    private onTimeout;
    constructor(timeline: TimelineLike, ms: number, cb: () => void);
    private start;
    private stop;
}
