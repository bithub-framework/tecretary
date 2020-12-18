import { Startable, StartableLike } from 'startable';
import { ContextLike, Config } from './interfaces';
interface StrategyConstructor {
    new (ctx: ContextLike): StartableLike;
}
declare class Tecretary extends Startable {
    private Strategy;
    private config;
    private dbReader;
    private strategy?;
    private forward?;
    private texchange?;
    private context?;
    private orderbooksIterator?;
    private tradesIterator?;
    constructor(Strategy: StrategyConstructor, config: Config);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private next;
}
export { Tecretary as default, Tecretary, };
