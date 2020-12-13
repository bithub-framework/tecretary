import { EventEmitter } from 'events';
import {
    Assets,
    OpenOrder,
    LimitOrder,
    Orderbook,
    Trade,
    Side,
    OrderId,
    MakerOrder,
    RawTrade,
} from './interfaces';

const PING = 10;
const PROCESSING = 10;

function opposite(side: Side): Side {
    return Side.ASK + Side.BID - side;
}

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

    public async makeLimitOrder(order: LimitOrder): Promise<OrderId> {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        const [maker, trades] = this.orderTakes(order);
        const openOrder = this.orderMakes(maker);
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
                        order.side === Side.BID &&
                        trade.side === Side.ASK &&
                        trade.price < order.price - Number.EPSILON
                    ) || (
                        order.side === Side.ASK &&
                        trade.side === Side.BID &&
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

    private orderTakes(order: LimitOrder): [MakerOrder, Trade[]] {
        const taker: LimitOrder = { ...order };
        const makerSide = opposite(taker.side);
        const trades: Trade[] = [];
        for (const [price, quantity] of this.incBook.getQuantity(makerSide)) {
            const maker: MakerOrder = {
                side: makerSide,
                price,
                quantity,
            };
            if (
                (
                    taker.side === Side.BID &&
                    taker.price > maker.price - Number.EPSILON
                ) || (
                    taker.side === Side.ASK &&
                    taker.price < maker.price + Number.EPSILON
                )
            )
                if (taker.quantity > maker.quantity - Number.EPSILON) {
                    trades.push({
                        side: taker.side,
                        price: maker.price,
                        quantity: maker.quantity,
                        time: this.now(),
                        id: ++this.tradeCount,
                    });
                    this.incBook.incQuantity(maker.side, maker.price, -maker.quantity);
                    taker.quantity -= maker.quantity;
                } else {
                    trades.push({
                        side: taker.side,
                        price: maker.price,
                        quantity: taker.quantity,
                        time: this.now(),
                        id: ++this.tradeCount,
                    });
                    this.incBook.incQuantity(maker.side, maker.price, -taker.quantity);
                    taker.quantity = 0;
                }
        }
        this.incBook.apply();
        return [taker, trades];
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
            [Side.ASK]: [...this.incBook.getQuantity(Side.ASK)]
                .map(([price, quantity]) => ({
                    price, quantity, side: Side.ASK,
                })),
            [Side.BID]: [...this.incBook.getQuantity(Side.BID)]
                .map(([price, quantity]) => ({
                    price, quantity, side: Side.BID,
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
        [Side.ASK]: [], [Side.BID]: [], time: Number.NEGATIVE_INFINITY,
    };
    private total = {
        [Side.ASK]: new Map<number, number>(),
        [Side.BID]: new Map<number, number>(),
    };
    private increment = {
        [Side.ASK]: new Map<number, number>(),
        [Side.BID]: new Map<number, number>(),
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
        for (const side of [Side.BID, Side.ASK]) {
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
