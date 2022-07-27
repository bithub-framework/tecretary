/// <reference types="node" />
import { MarketLike, AccountLike, HLike, MarketEvents } from 'secretary-like';
import { Texchange } from 'texchange';
import { EventEmitter } from 'events';
export declare class ContextMarket<H extends HLike<H>> extends EventEmitter implements MarketLike<H> {
    [accountId: number]: AccountLike<H>;
    PRICE_DP: number;
    QUANTITY_DP: number;
    CURRENCY_DP: number;
    TICK_SIZE: H;
    MARKET_NAME: string;
    on: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
    once: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
    off: <Event extends keyof MarketEvents<H>>(event: Event, listener: (...args: MarketEvents<H>[Event]) => void) => this;
    emit: <Event extends keyof MarketEvents<H>>(event: Event, ...args: MarketEvents<H>[Event]) => boolean;
    private facade;
    constructor(texchange: Texchange<H>);
    quantity(price: H, dollarVolume: H): H;
    dollarVolume(price: H, quantity: H): H;
}
