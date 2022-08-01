"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const secretary_like_1 = require("secretary-like");
const startable_1 = require("startable");
const startable_order_1 = require("./startable-order");
const events_1 = require("events");
class PositionController {
    constructor(ctx, interval) {
        this.ctx = ctx;
        this.interval = interval;
        this.$s = (0, startable_1.createStartable)(() => this.rawStart(), () => this.rawStop());
        this.onOrderbook = async (orderbook) => {
            try {
                this.orderbook = orderbook;
                if (this.shouldRemake())
                    await this.tryRemake();
            }
            catch (err) {
                console.error(err);
            }
        };
    }
    shouldRemake() {
        if (this.$s.getReadyState() === "STARTING" /* STARTING */ ||
            this.$s.getReadyState() === "STOPPING" /* STOPPING */)
            return false;
        if (this.nextGoal.neq(this.order.getGoal()))
            return true;
        if (this.order.$s.getReadyState() === "STARTED" /* STARTED */) {
            const limitOrder = this.order.getLimitOrder();
            if (limitOrder.price.eq(this.orderbook[secretary_like_1.Side.invert(limitOrder.side)][0].price.minus(this.ctx[0].TICK_SIZE.times(limitOrder.side === secretary_like_1.Side.BID ? 1 : -1))))
                return false;
        }
        if (this.order.$s.getReadyState() === "STOPPED" /* STOPPED */ &&
            this.order.getLatest() === this.order.getGoal())
            return false;
        return true;
    }
    async tryRemake() {
        if (this.order.$s.getReadyState() === "STARTED" /* STARTED */) {
            await this.order.$s.stop();
        }
        else if (this.order.$s.getReadyState() === "STOPPED" /* STOPPED */) {
            await this.remake();
        }
    }
    async remake() {
        const side = this.order.getLatest().lt(this.nextGoal) ? secretary_like_1.Side.BID : secretary_like_1.Side.ASK;
        const length = secretary_like_1.Length.from(side, secretary_like_1.Action.CLOSE);
        const price = this.orderbook[secretary_like_1.Side.invert(side)][0].price.minus(this.ctx[0].TICK_SIZE.times(side === secretary_like_1.Side.BID ? 1 : -1));
        const quantity = this.nextGoal.minus(this.order.getLatest()).abs();
        const source = {
            side,
            action: secretary_like_1.Action.CLOSE,
            length,
            price,
            quantity,
        };
        await this.order.$s.start([
            source,
            this.order.getLatest(),
            this.nextGoal,
        ]);
    }
    async rawStart() {
        const positions = await this.ctx[0][0].getPositions();
        const latest = positions.position[secretary_like_1.Length.LONG]
            .minus(positions.position[secretary_like_1.Length.SHORT]);
        const goal = latest;
        this.nextGoal = latest;
        this.order = new startable_order_1.StartableOrder(latest, goal, this.ctx);
        this.ctx[0].on('orderbook', this.onOrderbook);
        await (0, events_1.once)(this.ctx[0], 'orderbook');
    }
    async rawStop() {
        this.ctx[0].off('orderbook', this.onOrderbook);
    }
    async setGoal(nextGoal) {
        this.nextGoal = nextGoal;
    }
}
exports.PositionController = PositionController;
//# sourceMappingURL=position-controller.js.map