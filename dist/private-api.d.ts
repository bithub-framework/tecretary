import { LimitOrder, OpenOrder, OrderId, Assets, ContextAccountPrivateApiLike } from './interfaces';
import { Texchange } from 'texchange';
declare class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    private texchange;
    constructor(texchange: Texchange);
    makeLimitOrder(order: LimitOrder): Promise<OrderId>;
    cancelOrder(oid: OrderId): Promise<void>;
    getOpenOrders(): Promise<OpenOrder[]>;
    getAssets(): Promise<Assets>;
}
export { ContextAccountPrivateApi as default, ContextAccountPrivateApi, };
