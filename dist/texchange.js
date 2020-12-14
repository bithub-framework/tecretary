import { EventEmitter } from 'events';
import { BID, ASK, OPEN, CLOSE, LONG, SHORT, } from './interfaces';
const PING = 10;
const PROCESSING = 10;
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
        this.cost = {};
        // TODO
        this.cost[LONG] = this.cost[SHORT] = 0;
    }
    async makeLimitOrder(order, open = order.side === BID ? OPEN : CLOSE) {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        if (!open &&
            order.quantity > this.assets[~order.side] + Number.EPSILON)
            throw new Error('No enough position to close.');
        this.settle();
        if (open &&
            this.initialMargin(order) > this.assets.balance + Number.EPSILON)
            throw new Error('No enough available balance for margin.');
        const [maker, trades, volume, cost,] = this.orderTakes(order);
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
    async cancelOrder(oid) {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        this.openOrders.delete(oid);
        await this.sleep(PING);
    }
    updateTrades(trades) {
        for (let _trade of trades) {
            const trade = { ..._trade };
            for (const [oid, order] of this.openOrders)
                if ((order.side === BID &&
                    trade.side === ASK &&
                    trade.price < order.price - Number.EPSILON) || (order.side === ASK &&
                    trade.side === BID &&
                    trade.price > order.price + Number.EPSILON))
                    if (trade.quantity > order.quantity - Number.EPSILON) {
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
        // TODO
        const settlementPrice = 0;
        const unrealizedProfit = settlementPrice * this.assets[LONG] - this.cost[LONG] +
            this.cost[SHORT] - settlementPrice * this.assets[SHORT];
        this.assets.balance += unrealizedProfit;
        this.cost[LONG] = settlementPrice * this.assets[LONG];
        this.cost[SHORT] = settlementPrice * this.assets[SHORT];
    }
    initialMargin(order) {
        return order.price * (order.quantity + this.assets[order.side]);
    }
    orderTakes(order) {
        const taker = { ...order };
        const trades = [];
        let volume = 0;
        let cost = 0;
        for (const [price, quantity] of this.incBook.getQuantity(~taker.side)) {
            const maker = {
                side: ~taker.side,
                price,
                quantity,
            };
            if ((taker.side === BID &&
                taker.price > maker.price - Number.EPSILON) || (taker.side === ASK &&
                taker.price < maker.price + Number.EPSILON)) {
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
    orderMakes(order) {
        const openOrder = {
            side: order.side,
            price: order.price,
            quantity: order.quantity,
            id: ++this.orderCount,
        };
        if (openOrder.quantity > Number.EPSILON)
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
                if (Math.abs(increment) < Number.EPSILON)
                    return void this.increment[side].delete(price);
                let quantity;
                if (quantity = this.total[side].get(price)) {
                    if ((quantity += increment) < Number.EPSILON)
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
export { Texchange as default, Texchange, };
//# sourceMappingURL=texchange.js.map