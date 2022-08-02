"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalFollower = void 0;
const startable_1 = require("startable");
const auto_order_1 = require("./auto-order");
const node_time_engine_1 = require("node-time-engine");
const nodeTimeEngine = new node_time_engine_1.NodeTimeEngine();
// recyclable
class GoalFollower {
    constructor(latest, ctx, throttle) {
        this.latest = latest;
        this.ctx = ctx;
        this.throttle = throttle;
        this.$s = (0, startable_1.createStartable)(this.rawStart.bind(this), this.rawStop.bind(this));
        this.onOrderbook = async (orderbook) => {
            try {
                this.autoOrder = new auto_order_1.AutoOrder(orderbook, this.latest, this.goal, this.ctx, this.throttle);
                await this.autoOrder.$s.start([], async (err) => {
                    try {
                        await this.autoOrder.$s.stop();
                        this.latest = this.autoOrder.getLatest();
                        if (this.latest.eq(this.goal))
                            this.$s.starp();
                        else if (err instanceof auto_order_1.OrderbookMoving) {
                            if (this.$s.getReadyState() !== "STOPPING" /* STOPPING */)
                                this.ctx[0].once('orderbook', this.onOrderbook);
                        }
                        else
                            this.$s.starp();
                    }
                    catch (err) {
                        this.$s.starp(err);
                    }
                });
            }
            catch (err) {
                this.$s.starp(err);
            }
        };
        this.goal = latest;
    }
    async rawStart(goal) {
        this.goal = goal;
        this.ctx[0].once('orderbook', this.onOrderbook);
    }
    async rawStop() {
        this.ctx[0].off('orderbook', this.onOrderbook);
        if (this.autoOrder)
            await this.autoOrder.$s.starp();
    }
    getLatest() {
        return this.latest;
    }
}
exports.GoalFollower = GoalFollower;
//# sourceMappingURL=goal-follower.js.map