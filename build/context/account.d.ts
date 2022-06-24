/// <reference types="node" />
import { AccountLike, HLike, LimitOrder, Balances, Positions, OpenOrder, Amendment, AccountEvents } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange';
import { EventEmitter } from 'events';
export declare class ContextAccout<H extends HLike<H>> extends EventEmitter implements AccountLike<H> {
    on: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
    once: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
    off: <Event extends keyof AccountEvents<H>>(event: Event, listener: (...args: AccountEvents<H>[Event]) => void) => this;
    emit: <Event extends keyof AccountEvents<H>>(event: Event, ...args: AccountEvents<H>[Event]) => boolean;
    LEVERAGE: number;
    TAKER_FEE_RATE: number;
    MAKER_FEE_RATE: number;
    private facade;
    constructor(texchange: Texchange<H>);
    makeOrders($orders: LimitOrder<H>[]): Promise<(OpenOrder<H> | Error)[]>;
    amendOrders($amendments: Amendment<H>[]): Promise<(OpenOrder<H> | Error)[]>;
    cancelOrders($orders: OpenOrder<H>[]): Promise<OpenOrder<H>[]>;
    getBalances(): Promise<Balances<H>>;
    getPositions(): Promise<Positions<H>>;
    getOpenOrders(): Promise<OpenOrder<H>[]>;
}
