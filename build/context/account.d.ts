/// <reference types="node" />
import { AccountLike, HLike, LimitOrderLike, BalancesLike, PositionsLike, OpenOrderLike, AmendmentLike, AccountEvents } from 'secretary-like';
import { Texchange } from 'texchange';
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
    makeOrders($orders: LimitOrderLike<H>[]): Promise<(OpenOrderLike<H> | Error)[]>;
    amendOrders($amendments: AmendmentLike<H>[]): Promise<(OpenOrderLike<H> | Error)[]>;
    cancelOrders($orders: OpenOrderLike<H>[]): Promise<OpenOrderLike<H>[]>;
    getBalances(): Promise<BalancesLike<H>>;
    getPositions(): Promise<PositionsLike<H>>;
    getOpenOrders(): Promise<OpenOrderLike<H>[]>;
}
