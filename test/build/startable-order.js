"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fulfilled = exports.StartableOrder = void 0;
const startable_1 = require("startable");
const secretary_like_1 = require("secretary-like");
const assert = require("assert");
class StartableOrder {
    constructor(latest, goal, ctx) {
        this.latest = latest;
        this.goal = goal;
        this.ctx = ctx;
        this.$s = (0, startable_1.createStartable)(this.rawStart.bind(this), this.rawStop.bind(this));
        this.onPositions = (positions) => {
            this.latest = positions.position[secretary_like_1.Length.LONG]
                .minus(positions.position[secretary_like_1.Length.SHORT]);
            if (this.latest.eq(this.goal))
                this.$s.starp(new Fulfilled());
        };
        assert(latest.eq(goal));
    }
    async rawStart(source, latest, goal) {
        assert(latest.neq(goal));
        const limitOrder = this.ctx.DataTypes.limitOrderFactory.create(source);
        assert(limitOrder.quantity.times(source.side === secretary_like_1.Side.BID ? 1 : -1).eq(goal.minus(latest)));
        this.limitOrder = limitOrder;
        this.latest = latest;
        this.goal = goal;
        const [order] = await this.ctx[0][0].makeOrders([source]);
        assert(!(order instanceof Error), order);
        this.openOrder = order;
        this.ctx[0][0].on('positions', this.onPositions);
    }
    async rawStop(err) {
        this.ctx[0][0].off('positions', this.onPositions);
        if (err instanceof Fulfilled)
            return;
        const [cancelled] = await this.ctx[0][0].cancelOrders([this.getOpenOrder()]);
        this.latest = this.goal.minus(cancelled.unfilled.times(cancelled.side === secretary_like_1.Side.BID ? 1 : -1));
    }
    getLatest() {
        assert(this.$s.getReadyState() === "STOPPED" /* STOPPED */);
        return this.latest;
    }
    getGoal() {
        return this.goal;
    }
    getLimitOrder() {
        assert(this.$s.getReadyState() !== "STOPPED" /* STOPPED */);
        return this.limitOrder;
    }
    getOpenOrder() {
        assert(this.$s.getReadyState() === "STARTED" /* STARTED */ ||
            this.$s.getReadyState() === "STOPPING" /* STOPPING */);
        return this.openOrder;
    }
}
exports.StartableOrder = StartableOrder;
class Fulfilled extends Error {
}
exports.Fulfilled = Fulfilled;
//# sourceMappingURL=startable-order.js.map