"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const startable_1 = require("startable");
const pollerloop_1 = require("pollerloop");
const assert = require("assert");
const position_controller_1 = require("./position-controller");
const throttle_1 = require("./throttle");
class Strategy {
    constructor(ctx) {
        this.ctx = ctx;
        this.$s = (0, startable_1.createStartable)(() => this.rawStart(), () => this.rawStop());
        this.latestPrice = null;
        this.pc = new position_controller_1.PositionController(this.ctx, new throttle_1.Throttle(1000, this.ctx.timeline));
        this.loop = async (sleep) => {
            try {
                for (;;) {
                    let goal = '.01';
                    this.pc.setGoal(goal);
                    await sleep(60 * 1000);
                    if (goal === '.01')
                        goal = '-0.01';
                    else
                        goal = '.01';
                }
            }
            catch (err) {
                assert(err instanceof pollerloop_1.LoopStopped, err);
            }
        };
        this.onTrades = async (trades) => {
            this.latestPrice = trades[trades.length - 1].price;
            // console.log(`trades    - ${trades[0].time}`);
        };
        this.onOrderbook = async (orderbook) => {
            // console.log(`orderbook - ${orderbook.time}`);
        };
        this.onceOrderbook = async (orderbook) => {
            // console.log(`orderbook - ${orderbook.time}`);
            // const results = await this.ctx[0][0].makeOrders([{
            // 	price: orderbook[Side.ASK][0].price.minus(1),
            // 	quantity: orderbook[Side.ASK][0].quantity,
            // 	length: Length.LONG,
            // 	action: Action.OPEN,
            // 	side: Side.BID,
            // }]);
            // if (results[0] instanceof Error)
            // 	console.log(results[0]);
            // else
            // 	console.log(results[0].toJSON());
        };
        this.onError = (err) => {
            // console.error(err);
            this.$s.starp();
        };
        this.poller = new pollerloop_1.Pollerloop(this.loop, ctx.timeline);
    }
    async rawStart() {
        this.ctx[0].on('trades', this.onTrades);
        this.ctx[0].on('orderbook', this.onOrderbook);
        this.ctx[0].once('orderbook', this.onceOrderbook);
        this.ctx[0].on('error', this.onError);
        await this.poller.$s.start([], this.$s.starp);
    }
    async rawStop() {
        await this.poller.$s.stop();
        this.ctx[0].off('trades', this.onTrades);
        this.ctx[0].off('orderbook', this.onOrderbook);
        this.ctx[0].off('orderbook', this.onceOrderbook);
        this.ctx[0].off('error', this.onError);
    }
}
exports.Strategy = Strategy;
//# sourceMappingURL=strategy.js.map