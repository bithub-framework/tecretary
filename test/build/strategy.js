"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const secretary_like_1 = require("secretary-like");
const startable_1 = require("startable");
const pollerloop_1 = require("pollerloop");
const assert = require("assert");
class Strategy {
    constructor(ctx) {
        this.ctx = ctx;
        this.startable = startable_1.Startable.create(() => this.rawStart(), () => this.rawStop());
        this.start = this.startable.start;
        this.stop = this.startable.stop;
        this.assart = this.startable.assart;
        this.starp = this.startable.starp;
        this.getReadyState = this.startable.getReadyState;
        this.skipStart = this.startable.skipStart;
        this.latestPrice = null;
        this.bought = false;
        this.loop = async (sleep) => {
            try {
                for (;; await sleep(60 * 1000)) {
                    const balances = await this.ctx[0][0].getBalances();
                    console.log(JSON.stringify(balances));
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
            if (this.bought)
                return;
            this.bought = true;
            const results = await this.ctx[0][0].makeOrders([{
                    price: orderbook[secretary_like_1.Side.ASK][0].price,
                    quantity: orderbook[secretary_like_1.Side.ASK][0].quantity,
                    length: secretary_like_1.Length.LONG,
                    action: secretary_like_1.Action.OPEN,
                    side: secretary_like_1.Side.BID,
                }]);
            console.log(JSON.stringify(results[0]));
        };
        this.onError = (err) => {
            // console.error(err);
            this.starp();
        };
        this.poller = new pollerloop_1.Pollerloop(this.loop, ctx.timeline);
    }
    async rawStart() {
        this.ctx[0].on('trades', this.onTrades);
        this.ctx[0].on('orderbook', this.onOrderbook);
        this.ctx[0].on('error', this.onError);
        await this.poller.start(this.starp);
    }
    async rawStop() {
        this.ctx[0].off('trades', this.onTrades);
        this.ctx[0].off('orderbook', this.onOrderbook);
        this.ctx[0].off('error', this.onError);
        await this.poller.stop();
    }
}
exports.Strategy = Strategy;
//# sourceMappingURL=strategy.js.map