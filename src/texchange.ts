import { EventEmitter } from 'events';
import {
    Assets,
    Cost,
    OpenOrder,
    LimitOrder,
    Orderbook,
    Trade,
    Side, BID, ASK,
    OrderId,
    MakerOrder,
    RawTrade,
    Open, OPEN, CLOSE,
    Long, LONG, SHORT,
} from './interfaces';

const PING = 10;
const PROCESSING = 10;

class Texchange extends EventEmitter {
    private tradeCount = 0;
    private orderCount = 0;
    private openOrders = new Map<OrderId, OpenOrder>();
    private incBook = new IncrementalBook();
    private cost: Cost = {};

    constructor(
        private assets: Assets,
        private sleep: (ms: number) => Promise<void>,
        private now: () => number,
    ) {
        super();
        // TODO
        this.cost[LONG] = this.cost[SHORT] = 0;
    }

    public async makeLimitOrder(
        order: LimitOrder,
        open: Open = order.side === BID ? OPEN : CLOSE,
    ): Promise<OrderId> {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        if (
            !open &&
            order.quantity > this.assets[~order.side] + Number.EPSILON
        ) throw new Error('No enough position to close.');
        this.settle();
        if (
            open &&
            this.initialMargin(order) > this.assets.balance + Number.EPSILON
        ) throw new Error('No enough available balance for margin.');

        const [
            maker,
            trades,
            volume,
            cost,
        ] = this.orderTakes(order);
        const openOrder = this.orderMakes(maker);
        // CHECK
        if (~open) {
            const realizedProfit = cost
                - volume * this.cost[order.side ^ ~open] / this.assets[order.side ^ ~open];
            this.assets.balance += realizedProfit;
        }
        this.assets[order.side ^ ~open] += (open - ~open) * volume;
        this.cost[order.side ^ ~open] += (open - ~open) * cost;
        this.pushTrades(trades);
        this.pushOrderbook();
        await this.sleep(PING);
        return openOrder.id;
    }

    public async cancelOrder(oid: OrderId): Promise<void> {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        this.openOrders.delete(oid);
        await this.sleep(PING);
    }

    public updateTrades(trades: RawTrade[]): void {
        for (let _trade of trades) {
            const trade: RawTrade = { ..._trade };
            for (const [oid, order] of this.openOrders)
                if (
                    (
                        order.side === BID &&
                        trade.side === ASK &&
                        trade.price < order.price - Number.EPSILON
                    ) || (
                        order.side === ASK &&
                        trade.side === BID &&
                        trade.price > order.price + Number.EPSILON
                    )
                )
                    if (trade.quantity > order.quantity - Number.EPSILON) {
                        trade.quantity -= order.quantity;
                        this.openOrders.delete(oid);
                    } else {
                        trade.quantity = 0;
                        order.quantity -= trade.quantity;
                    }
        }
        this.pushTrades(trades);
    }

    public updateOrderbook(orderbook: Orderbook): void {
        this.incBook.setBase(orderbook);
        this.incBook.apply();
        this.pushOrderbook();
    }

    private settle(): void {
        // TODO
        const settlementPrice: number = 0;
        const unrealizedProfit =
            settlementPrice * this.assets[LONG] - this.cost[LONG] +
            this.cost[SHORT] - settlementPrice * this.assets[SHORT];
        this.assets.balance += unrealizedProfit;
        this.cost[LONG] = settlementPrice * this.assets[LONG];
        this.cost[SHORT] = settlementPrice * this.assets[SHORT];
    }

    private initialMargin(order: LimitOrder): number {
        return order.price * (order.quantity + this.assets[order.side]);
    }

    private orderTakes(order: LimitOrder): [
        MakerOrder,
        Trade[],
        number,
        number,
    ] {
        const taker: LimitOrder = { ...order };
        const trades: Trade[] = [];
        let volume = 0;
        let cost = 0;
        for (const [price, quantity] of this.incBook.getQuantity(~taker.side)) {
            const maker: MakerOrder = {
                side: ~taker.side,
                price,
                quantity,
            };
            if (
                (
                    taker.side === BID &&
                    taker.price > maker.price - Number.EPSILON
                ) || (
                    taker.side === ASK &&
                    taker.price < maker.price + Number.EPSILON
                )
            ) {
                const quantity = Math.min(taker.quantity, maker.quantity);
                trades.push({
                    side: taker.side,
                    price: maker.price,
                    quantity,
                    time: this.now(),
                    id: ++this.tradeCount,
                });
                this.incBook.incQuantity(maker.side, maker.price, -quantity);
                taker.quantity -= quantity;
                volume += quantity;
                cost += quantity * maker.price;
            }
        }
        this.incBook.apply();
        return [
            taker,
            trades,
            volume,
            cost
        ];
    }

    private orderMakes(order: MakerOrder): OpenOrder {
        const openOrder: OpenOrder = {
            side: order.side,
            price: order.price,
            quantity: order.quantity,
            id: ++this.orderCount,
        };
        if (openOrder.quantity > Number.EPSILON)
            this.openOrders.set(openOrder.id, openOrder);
        return openOrder;
    }

    private async pushOrderbook(): Promise<void> {
        const orderbook: Orderbook = {
            [ASK]: [...this.incBook.getQuantity(ASK)]
                .map(([price, quantity]) => ({
                    price, quantity, side: ASK,
                })),
            [BID]: [...this.incBook.getQuantity(BID)]
                .map(([price, quantity]) => ({
                    price, quantity, side: BID,
                })),
            time: this.now(),
        };
        await this.sleep(PING);
        this.emit('orderbook', orderbook);
    }

    private async pushTrades(rawTrades: RawTrade[]): Promise<void> {
        await this.sleep(PING);
        const trades: Trade[] = rawTrades.map(rawTrade => ({
            ...rawTrade,
            id: ++this.tradeCount,
        }));
        this.emit('trades', trades);
    }
}

class IncrementalBook {
    private baseBook: Orderbook = {
        [ASK]: [], [BID]: [], time: Number.NEGATIVE_INFINITY,
    };
    private total = {
        [ASK]: new Map<number, number>(),
        [BID]: new Map<number, number>(),
    };
    private increment = {
        [ASK]: new Map<number, number>(),
        [BID]: new Map<number, number>(),
    };

    public setBase(origin: Orderbook) {
        this.baseBook = origin;
    }

    public incQuantity(side: Side, price: number, increment: number) {
        const origin = this.increment[side].get(price) || 0;
        this.increment[side].set(price, origin + increment);
    }

    public getQuantity(side: Side): Map<number, number> {
        return this.total[side];
    }

    public apply(): void {
        for (const side of [BID, ASK]) {
            this.total[side].clear();
            this.baseBook[side].forEach(order =>
                void this.total[side].set(order.price, order.quantity)
            );
            this.increment[side].forEach((increment, price) => {
                if (Math.abs(increment) < Number.EPSILON)
                    return void this.increment[side].delete(price);
                let quantity: number | undefined;
                if (quantity = this.total[side].get(price)) {
                    if ((quantity += increment) < Number.EPSILON)
                        this.total[side].delete(price);
                    else this.total[side].set(price, quantity);
                } else this.increment[side].delete(price);
            });
        }
    }
}

export {
    Texchange as default,
    Texchange,
}
