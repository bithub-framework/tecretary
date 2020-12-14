import fetch from 'node-fetch';
import {
    LimitOrder,
    OpenOrder,
    OrderId,
    InstanceConfig,
    ContextAccountPrivateApiLike,
    BID,
} from './interfaces';
import { Texchange } from 'texchange';

class ContextAccountPrivateApi implements ContextAccountPrivateApiLike {
    constructor(
        config: InstanceConfig,
        mid: number,
        aid: number,
        private texchange: Texchange,
    ) {
    }

    public async makeLimitOrder(
        order: LimitOrder,
        open = order.side === BID,
    ): Promise<OrderId> {
        return this.texchange.makeLimitOrder(order, open);
    }

    public async cancelOrder(oid: OrderId): Promise<void> {
        return this.texchange.cancelOrder(oid);
    }

    public async getOpenOrders(): Promise<OpenOrder[]> {
        return this.texchange.getOpenOrders();
    }
}

export {
    ContextAccountPrivateApi as default,
    ContextAccountPrivateApi,
};
