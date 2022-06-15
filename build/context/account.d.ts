import { AccountLike, HLike, LimitOrder, Balances, Positions, OpenOrder, Amendment } from 'secretary-like';
import { AccountSpec } from 'secretary-like';
import { AccountEventEmitterLike } from 'secretary-like';
import { Texchange } from 'texchange/build/texchange/texchange';
export declare class ContextAccout<H extends HLike<H>> implements AccountLike<H> {
    spec: AccountSpec;
    events: AccountEventEmitterLike<H>;
    private facade;
    constructor(texchange: Texchange<H>);
    makeOrders($orders: LimitOrder<H>[]): Promise<(OpenOrder<H> | Error)[]>;
    amendOrders($amendments: Amendment<H>[]): Promise<(OpenOrder<H> | Error)[]>;
    cancelOrders($orders: OpenOrder<H>[]): Promise<OpenOrder<H>[]>;
    getBalances(): Promise<Balances<H>>;
    getPositions(): Promise<Positions<H>>;
    getOpenOrders(): Promise<OpenOrder<H>[]>;
}
