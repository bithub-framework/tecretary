import { ContextLike, HLike, H } from 'secretary-like';
import { Throttle } from './throttle';
export declare class PositionController<H extends HLike<H>> {
    private ctx;
    private throttle;
    private latest?;
    private goal?;
    private follower?;
    $s: import("startable").Startable<[]>;
    constructor(ctx: ContextLike<H>, throttle: Throttle);
    private rawStart;
    private rawStop;
    setGoal(goal: H.Source<H>): Promise<void>;
}
