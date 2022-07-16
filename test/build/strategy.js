"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const startable_1 = require("startable");
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
        this.onTrades = (trades) => {
            this.latestPrice = trades[trades.length - 1].price;
            console.log(`trades    - ${trades[0].time}`);
        };
        this.onOrderbook = (orderbook) => {
            console.log(`orderbook - ${orderbook.time}`);
        };
    }
    async rawStart() {
        this.ctx[0].on('trades', this.onTrades);
        this.ctx[0].on('orderbook', this.onOrderbook);
    }
    async rawStop() {
        this.ctx[0].off('trades', this.onTrades);
        this.ctx[0].off('orderbook', this.onOrderbook);
    }
}
exports.Strategy = Strategy;
//# sourceMappingURL=strategy.js.map