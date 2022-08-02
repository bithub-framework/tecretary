"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookMoving = exports.AutoOrder = void 0;
const startable_1 = require("startable");
const secretary_like_1 = require("secretary-like");
const assert = require("assert");
// disposable
class AutoOrder {
    constructor(orderbook, latest, goal, ctx, throttle) {
        this.latest = latest;
        this.goal = goal;
        this.ctx = ctx;
        this.throttle = throttle;
        this.$s = (0, startable_1.createStartable)(this.rawStart.bind(this), this.rawStop.bind(this));
        this.onPositions = (positions) => {
            this.latest = positions.position[secretary_like_1.Length.LONG]
                .minus(positions.position[secretary_like_1.Length.SHORT]);
            if (this.latest.eq(this.goal))
                this.$s.starp();
        };
        this.onOrderbook = (orderbook) => {
            if (this.limitOrder.side === secretary_like_1.Side.BID &&
                orderbook[secretary_like_1.Side.BID][0].price.gt(this.limitOrder.price)
                ||
                    this.limitOrder.side === secretary_like_1.Side.ASK &&
                        orderbook[secretary_like_1.Side.ASK][0].price.lt(this.limitOrder.price))
                this.$s.starp(new OrderbookMoving());
        };
        const price = this.latest.lt(this.goal)
            ? orderbook[secretary_like_1.Side.ASK][0].price.minus(this.ctx[0].TICK_SIZE)
            : orderbook[secretary_like_1.Side.BID][0].price.plus(this.ctx[0].TICK_SIZE);
        const quantity = this.goal.minus(this.latest).abs();
        const side = this.latest.lt(this.goal) ? secretary_like_1.Side.BID : secretary_like_1.Side.ASK;
        const action = secretary_like_1.Action.CLOSE;
        const length = secretary_like_1.Length.from(side, action);
        this.limitOrder = this.ctx.DataTypes.limitOrderFactory.create({
            price, quantity, side, action, length,
        });
        if (this.limitOrder.side === secretary_like_1.Side.BID)
            this.goal = latest.plus(this.limitOrder.quantity);
        else
            this.goal = latest.minus(this.limitOrder.quantity);
    }
    async rawStart() {
        const [openOrder] = await this.throttle.invoke(this.ctx[0][0].makeOrders)([this.limitOrder]);
        assert(!(openOrder instanceof Error), openOrder);
        this.openOrder = openOrder;
        this.ctx[0][0].on('positions', this.onPositions);
        this.ctx[0].on('orderbook', this.onOrderbook);
    }
    async rawStop(err) {
        this.ctx[0].off('orderbook', this.onOrderbook);
        this.ctx[0][0].off('positions', this.onPositions);
        if (err instanceof OrderbookMoving) {
            [this.openOrder] = await this.throttle.invoke(this.ctx[0][0].cancelOrders)([
                this.openOrder,
            ]);
            this.latest = this.openOrder.side === secretary_like_1.Side.BID
                ? this.goal.minus(this.openOrder.unfilled)
                : this.goal.plus(this.openOrder.unfilled);
        }
    }
    getLatest() {
        assert(this.$s.getReadyState() === "STOPPED" /* STOPPED */);
        return this.latest;
    }
}
exports.AutoOrder = AutoOrder;
class OrderbookMoving extends Error {
}
exports.OrderbookMoving = OrderbookMoving;
//# sourceMappingURL=auto-order.js.map