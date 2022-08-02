import { HLike, ContextLike } from 'secretary-like';
import { Throttle } from './throttle';
export declare class GoalFollower<H extends HLike<H>> {
    private latest;
    private ctx;
    private throttle;
    $s: import("startable").Startable<[goal: H]>;
    private autoOrder?;
    private goal;
    constructor(latest: H, ctx: ContextLike<H>, throttle: Throttle);
    private onOrderbook;
    private rawStart;
    private rawStop;
    getLatest(): H;
}
