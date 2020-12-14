import { EventEmitter } from 'events';
import { BID, ASK, LONG, SHORT, } from './interfaces';
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
    constructor(assets, sleep, now) {
        super();
        this.assets = assets;
        this.sleep = sleep;
        this.now = now;
        this.tradeCount = 0;
        this.orderCount = 0;
        this.openOrders = new Map();
        this.incBook = new IncrementalBook();
        this.settlementPrice = 0;
    }
    async makeLimitOrder(order, open = order.side === BID) {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        if (!open &&
            order.quantity > this.assets.position[~order.side] + EPSILON)
            throw new Error('No enough position to close.');
        this.settle();
        if (open &&
            order.price * order.quantity
                < this.assets.reserve * this.assets.leverage - EPSILON)
            throw new Error('No enough available balance as margin.');
        const [makerOrder, trades, volume, dollarVolume,] = this.orderTakes(order);
        const openOrder = this.orderMakes(makerOrder);
        if (open) {
            this.assets.position[order.side] += volume;
            this.assets.cost[order.side] += dollarVolume;
        }
        else {
            const costPrice = Math.round(100 *
                this.assets.cost[~order.side] / this.assets.position[~order.side]) / 100;
            const cost = volume > this.assets.position[~order.side] - EPSILON
                ? this.assets.cost[~order.side]
                : volume * costPrice;
            const realizedProfit = (~order.side - order.side)
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
    async cancelOrder(oid) {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        this.openOrders.delete(oid);
        await this.sleep(PING);
    }
    updateTrades(trades) {
        for (let _trade of trades) {
            const trade = { ..._trade };
            this.settlementPrice
                = this.settlementPrice * .9
                    + trade.price + .1;
            for (const [oid, order] of this.openOrders)
                if (order.side !== trade.side &&
                    (order.side - trade.side) * (order.price - trade.price)
                        > EPSILON)
                    if (trade.quantity > order.quantity - EPSILON) {
                        trade.quantity -= order.quantity;
                        this.openOrders.delete(oid);
                    }
                    else {
                        trade.quantity = 0;
                        order.quantity -= trade.quantity;
                    }
        }
        this.pushTrades(trades);
    }
    updateOrderbook(orderbook) {
        this.incBook.setBase(orderbook);
        this.incBook.apply();
        this.pushOrderbook();
    }
    settle() {
        const price = this.settlementPrice;
        const { position, cost, } = this.assets;
        const unrealizedProfit = (price * position[LONG] - cost[LONG]) +
            (cost[SHORT] - price * position[SHORT]);
        this.assets.balance += unrealizedProfit;
        this.assets.cost[LONG] = price * position[LONG];
        this.assets.cost[SHORT] = price * position[SHORT];
        this.calcAssets();
    }
    orderTakes(order) {
        const taker = { ...order };
        const trades = [];
        let volume = 0;
        let dollarVolume = 0;
        for (const [price, quantity] of this.incBook.getQuantity(~taker.side)) {
            const maker = {
                side: ~taker.side,
                price,
                quantity,
            };
            if ((taker.side === BID &&
                taker.price > maker.price - EPSILON) || (taker.side === ASK &&
                taker.price < maker.price + EPSILON)) {
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
    orderMakes(order) {
        const openOrder = {
            side: order.side,
            price: order.price,
            quantity: order.quantity,
            id: ++this.orderCount,
        };
        if (openOrder.quantity > EPSILON)
            this.openOrders.set(openOrder.id, openOrder);
        return openOrder;
    }
    async pushOrderbook() {
        const orderbook = {
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
    async pushTrades(rawTrades) {
        await this.sleep(PING);
        const trades = rawTrades.map(rawTrade => ({
            ...rawTrade,
            id: ++this.tradeCount,
        }));
        this.emit('trades', trades);
    }
    calcAssets() {
        const { cost, leverage, balance, margin, } = this.assets;
        this.assets.margin[LONG] = cost[LONG] / leverage;
        this.assets.margin[SHORT] = cost[SHORT] / leverage;
        this.assets.reserve = balance - (margin[LONG] + margin[SHORT]);
    }
}
class IncrementalBook {
    constructor() {
        this.baseBook = {
            [ASK]: [], [BID]: [], time: Number.NEGATIVE_INFINITY,
        };
        this.total = {
            [ASK]: new Map(),
            [BID]: new Map(),
        };
        this.increment = {
            [ASK]: new Map(),
            [BID]: new Map(),
        };
    }
    setBase(origin) {
        this.baseBook = origin;
    }
    incQuantity(side, price, increment) {
        const origin = this.increment[side].get(price) || 0;
        this.increment[side].set(price, origin + increment);
    }
    getQuantity(side) {
        return this.total[side];
    }
    apply() {
        for (const side of [BID, ASK]) {
            this.total[side].clear();
            this.baseBook[side].forEach(order => void this.total[side].set(order.price, order.quantity));
            this.increment[side].forEach((increment, price) => {
                if (Math.abs(increment) < EPSILON)
                    return void this.increment[side].delete(price);
                let quantity;
                if (quantity = this.total[side].get(price)) {
                    if ((quantity += increment) < EPSILON)
                        this.total[side].delete(price);
                    else
                        this.total[side].set(price, quantity);
                }
                else
                    this.increment[side].delete(price);
            });
        }
    }
}
export { Texchange as default, Texchange, IncrementalBook, };
//# sourceMappingURL=texchange.js.map