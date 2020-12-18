import {
    LimitOrder,
    OpenOrder,
    OrderId,
    Assets,
    ContextAccountPrivateApiLike,
} from './interfaces';
import { Texchange } from 'texchange';

class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    constructor(
        private texchange: Texchange,
    ) { }

    public async makeLimitOrder(order: LimitOrder): Promise<OrderId> {
        return this.texchange.makeLimitOrder(order);
    }

    public async cancelOrder(oid: OrderId): Promise<void> {
        return this.texchange.cancelOrder(oid);
    }

    public async getOpenOrders(): Promise<OpenOrder[]> {
        return this.texchange.getOpenOrders();
    }

    public async getAssets(): Promise<Assets> {
        return this.texchange.getAssets();
    }
}

export {
    ContextAccountPrivateApi as default,
    ContextAccountPrivateApi,
};
