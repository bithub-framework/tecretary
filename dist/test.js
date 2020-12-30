import { Startable, adaptor, } from 'startable';
import { Tecretary, } from './index';
import { LONG, SHORT, OPEN, CLOSE, BID, ASK, LimitOrder, } from 'interfaces';
import Big from 'big.js';
function f(x) {
    return JSON.parse(JSON.stringify(x));
}
class Strategy extends Startable {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.locked = false;
        this.count = 0;
        ctx[0].on('orderbook', async (orderbook) => {
            try {
                if (++this.count % 100000 === 0) {
                    console.log(this.count);
                }
                if (this.locked)
                    return;
                this.locked = true;
                if (orderbook[ASK][0].price.lte(19200)) {
                    let order;
                    this.assets = await this.ctx[0][0].getAssets();
                    if (this.lifePeriod !== "STARTED" /* STARTED */)
                        return;
                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets.position[SHORT],
                        length: SHORT,
                        operation: CLOSE,
                    });
                    if (order.quantity.gt(0)) {
                        console.log(f(this.assets));
                        console.log(f(order));
                        await this.ctx[0][0].makeLimitOrder(order);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        this.assets = await this.ctx[0][0].getAssets();
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        console.log(f(this.assets));
                        console.log('\n');
                        // await this.submitAssets(this.assets);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                    }
                    if (this.lifePeriod !== "STARTED" /* STARTED */)
                        return;
                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets.reserve.div(19200).times(1000)
                            .times(10)
                            .minus(1)
                            .round(0),
                        length: LONG,
                        operation: OPEN,
                    });
                    if (order.quantity.gt(0)) {
                        console.log(f(this.assets));
                        console.log(f(order));
                        await this.ctx[0][0].makeLimitOrder(order);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        this.assets = await this.ctx[0][0].getAssets();
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        console.log(f(this.assets));
                        console.log('\n');
                        // await this.submitAssets(this.assets);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                    }
                }
                if (orderbook[BID][0].price.gte(19300)) {
                    let order;
                    this.assets = await this.ctx[0][0].getAssets();
                    if (this.lifePeriod !== "STARTED" /* STARTED */)
                        return;
                    order = LimitOrder.from({
                        price: new Big(19300),
                        quantity: this.assets.position[LONG],
                        length: LONG,
                        operation: CLOSE,
                    });
                    if (order.quantity.gt(0)) {
                        console.log(f(this.assets));
                        console.log(f(order));
                        await this.ctx[0][0].makeLimitOrder(order);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        this.assets = await this.ctx[0][0].getAssets();
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        console.log(f(this.assets));
                        console.log('');
                        // await this.submitAssets(this.assets);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                    }
                    if (this.lifePeriod !== "STARTED" /* STARTED */)
                        return;
                    order = LimitOrder.from({
                        price: new Big(19300),
                        quantity: this.assets.reserve.div(19300).times(1000)
                            .times(10)
                            .minus(1)
                            .round(0),
                        length: SHORT,
                        operation: OPEN,
                    });
                    if (order.quantity.gt(0)) {
                        console.log(f(this.assets));
                        console.log(f(order));
                        await this.ctx[0][0].makeLimitOrder(order);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        this.assets = await this.ctx[0][0].getAssets();
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                        console.log(f(this.assets));
                        console.log('');
                        // await this.submitAssets(this.assets);
                        if (this.lifePeriod !== "STARTED" /* STARTED */)
                            return;
                    }
                }
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
            this.locked = false;
        });
    }
    // private async submitAssets(assets: Assets) {
    //     const res = await this.ctx.escape(fetch(`${REDIRECTOR_URL}/secretariat/assets?id=test`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(assets),
    //     }));
    //     assert(res.ok);
    // }
    async _start() {
        await this.syncAssets();
        this.startTime = Date.now();
    }
    async _stop(err) {
        if (this.startTime)
            console.log(Date.now() - this.startTime);
        if (!err) {
            let order;
            order = LimitOrder.from({
                price: new Big(0),
                quantity: this.assets.position[LONG],
                length: LONG,
                operation: CLOSE,
            });
            if (order.quantity.gt(0)) {
                console.log(f(this.assets));
                console.log(f(order));
                await this.ctx[0][0].makeLimitOrder(order);
                console.log(f(await this.ctx[0][0].getAssets()));
            }
        }
    }
    async syncAssets() {
        this.assets = await this.ctx[0][0].getAssets();
    }
}
const tecretary = new Tecretary(Strategy, {
    projectId: 'test',
    DB_FILE_PATH: '/home/zim/Downloads/day.db',
    initialAssets: {
        balance: new Big(100),
        cost: {
            [LONG]: new Big(0),
            [SHORT]: new Big(0),
        },
        position: {
            [LONG]: new Big(0),
            [SHORT]: new Big(0),
        },
        time: 1607270831009,
    },
    leverage: 10,
    PING: 10,
    PROCESSING: 10,
    MAKER_FEE_RATE: .0002,
    TAKER_FEE_RATE: .0004,
    PRICE_DP: 1,
    QUANTITY_DP: 0,
    CURRENCY_DP: 2,
    calcDollarVolume(price, quantity) {
        return price.times('.001').times(quantity);
    }
});
adaptor(tecretary);
//# sourceMappingURL=test.js.map