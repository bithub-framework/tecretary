import { EventEmitter } from 'events';
const PING = 10;
const PROCESSING = 10;
function opposite(side) {
    return 1 /* ASK */ + 0 /* BID */ - side;
}
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
    }
    async makeLimitOrder(order) {
        await this.sleep(PING);
        await this.sleep(PROCESSING);
        const [maker, trades] = this.orderTakes(order);
        const openOrder = this.orderMakes(maker);
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
                if ((order.side === 0 /* BID */ &&
                    trade.side === 1 /* ASK */ &&
                    trade.price < order.price - Number.EPSILON) || (order.side === 1 /* ASK */ &&
                    trade.side === 0 /* BID */ &&
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
    orderTakes(order) {
        const taker = { ...order };
        const makerSide = opposite(taker.side);
        const trades = [];
        for (const [price, quantity] of this.incBook.getQuantity(makerSide)) {
            const maker = {
                side: makerSide,
                price,
                quantity,
            };
            if ((taker.side === 0 /* BID */ &&
                taker.price > maker.price - Number.EPSILON) || (taker.side === 1 /* ASK */ &&
                taker.price < maker.price + Number.EPSILON))
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
                }
                else {
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
            [1 /* ASK */]: [...this.incBook.getQuantity(1 /* ASK */)]
                .map(([price, quantity]) => ({
                price, quantity, side: 1 /* ASK */,
            })),
            [0 /* BID */]: [...this.incBook.getQuantity(0 /* BID */)]
                .map(([price, quantity]) => ({
                price, quantity, side: 0 /* BID */,
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
            [1 /* ASK */]: [], [0 /* BID */]: [], time: Number.NEGATIVE_INFINITY,
        };
        this.total = {
            [1 /* ASK */]: new Map(),
            [0 /* BID */]: new Map(),
        };
        this.increment = {
            [1 /* ASK */]: new Map(),
            [0 /* BID */]: new Map(),
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
        for (const side of [0 /* BID */, 1 /* ASK */]) {
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