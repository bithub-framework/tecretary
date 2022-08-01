import { ContextLike, HLike } from 'secretary-like';
export declare class PositionController<H extends HLike<H>> {
    private ctx;
    private interval;
    private nextGoal?;
    private order?;
    private orderbook?;
    $s: import("startable").Startable<[]>;
    constructor(ctx: ContextLike<H>, interval: number);
    private onOrderbook;
    private shouldRemake;
    private tryRemake;
    private remake;
    private rawStart;
    private rawStop;
    setGoal(nextGoal: H): Promise<void>;
}
