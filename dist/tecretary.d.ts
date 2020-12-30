import { Startable } from 'startable';
import { Config, StrategyConstructor } from './interfaces';
declare class Tecretary extends Startable {
    private Strategy;
    private config;
    private dbReader;
    private strategy;
    private forward;
    private texchange;
    private context;
    private orderbooksIterator;
    private tradesIterator;
    private pollerloop;
    constructor(Strategy: StrategyConstructor, config: Config);
    protected _start(): Promise<void>;
    protected _stop(err?: Error): Promise<void>;
    private loop;
}
export { Tecretary as default, Tecretary, };
