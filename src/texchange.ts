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
    Length, LONG, SHORT,
} from './interfaces';

const PING = 10;
const PROCESSING = 10;
const PRICE_PRECISION = 1e-2;
const QUANTITY_PRECISION = 1e-2;
const LEVERAGE_PRECISION = 1e-3;
const EPSILON = .1
    * PRICE_PRECISION
    * QUANTITY_PRECISION
    * LEVERAGE_PRECISION;

class Texchange extends EventEmitter {
    private tradeCount = 0;
    private orderCount = 0;
    private openOrders = new Map<OrderId, OpenOrder>();
    private incBook = new IncrementalBook();

    constructor(
        private assets: Assets,
        private sleep: (ms: number) => Promise<void>,
        private now: () => number,
    ) {
        super();
    }

    public async makeLimitOrder(
        order: LimitOrder,
        open = order.side === BID,
    ): Promise<OrderId> {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        if (
            !open &&
            order.quantity > this.assets.position[~order.side] + EPSILON
        ) throw new Error('No enough position to close.');
        this.settle();
        if (
            open &&
            order.price * order.quantity
            < this.assets.reserve * this.assets.leverage - EPSILON
        ) throw new Error('No enough available balance as margin.');

        const [
            makerOrder,
            trades,
            volume,
            dollarVolume,
        ] = this.orderTakes(order);
        const openOrder = this.orderMakes(makerOrder);
        if (open) {
            this.assets.position[order.side] += volume;
            this.assets.cost[order.side] += dollarVolume;
        } else {
            const costPrice = Math.round(100 *
                this.assets.cost[~order.side] / this.assets.position[~order.side]
            ) / 100;
            const cost = volume > this.assets.position[~order.side] - EPSILON
                ? this.assets.cost[~order.side]
                : volume * costPrice;
            const realizedProfit
                = (~order.side - order.side)
                * (dollarVolume - cost);
            this.assets.balance += realizedProfit;
            this.assets.position[~order.side] -= volume;
            this.assets.cost[~order.side] -= cost;
            this.calcAssets();
        }
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
                    order.side !== trade.side &&
                    (order.side - trade.side) * (order.price - trade.price)
                    > EPSILON
                )
                    if (trade.quantity > order.quantity - EPSILON) {
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
        const price: number = 0;
        const {
            position,
            cost,
        } = this.assets;
        const unrealizedProfit =
            (price * position[LONG] - cost[LONG]) +
            (cost[SHORT] - price * position[SHORT]);
        this.assets.balance += unrealizedProfit;
        this.assets.cost[LONG] = price * position[LONG];
        this.assets.cost[SHORT] = price * position[SHORT];
        this.calcAssets();
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
        let dollarVolume = 0;
        for (const [price, quantity] of this.incBook.getQuantity(~taker.side)) {
            const maker: MakerOrder = {
                side: ~taker.side,
                price,
                quantity,
            };
            if (
                (
                    taker.side === BID &&
                    taker.price > maker.price - EPSILON
                ) || (
                    taker.side === ASK &&
                    taker.price < maker.price + EPSILON
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
                dollarVolume += quantity * maker.price;
            }
        }
        this.incBook.apply();
        return [
            taker,
            trades,
            volume,
            dollarVolume
        ];
    }

    private orderMakes(order: MakerOrder): OpenOrder {
        const openOrder: OpenOrder = {
            side: order.side,
            price: order.price,
            quantity: order.quantity,
            id: ++this.orderCount,
        };
        if (openOrder.quantity > EPSILON)
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

    private calcAssets() {
        const {
            cost,
            leverage,
            balance,
            margin,
        } = this.assets;
        this.assets.margin[LONG] = cost[LONG] / leverage;
        this.assets.margin[SHORT] = cost[SHORT] / leverage;
        this.assets.reserve = balance - (margin[LONG] + margin[SHORT]);
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
                if (Math.abs(increment) < EPSILON)
                    return void this.increment[side].delete(price);
                let quantity: number | undefined;
                if (quantity = this.total[side].get(price)) {
                    if ((quantity += increment) < EPSILON)
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
