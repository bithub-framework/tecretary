import { Startable, adaptor, } from 'startable';
import { Tecretary, LONG, SHORT, OPEN, CLOSE, BID, ASK, LimitOrder, } from './index';
import Big from 'big.js';
function f(x) {
    return JSON.parse(JSON.stringify(x));
}
class Strategy extends Startable {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.locked = false;
        // ctx[0].on('orderbook', orderbook =>
        //     void console.log(f(orderbook)));
        // ctx[0].on('trades', trades =>
        //     void console.log(f(trades)));
        ctx[0].on('orderbook', async (orderbook) => {
            try {
                console.log(JSON.stringify(orderbook));
                if (this.locked)
                    return;
                this.locked = true;
                if (orderbook[ASK][0].price.lte(19200)) {
                    let order;
                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets.position[SHORT],
                        length: SHORT,
                        operation: CLOSE
                    });
                    if (order.quantity.gt(0)) {
                        console.log(JSON.stringify(order));
                        await this.ctx[0][0].makeLimitOrder(order);
                    }
                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets.reserve.div(19200).times(1000)
                            .round(0),
                        length: LONG,
                        operation: OPEN,
                    });
                    console.log(f(order));
                    await this.ctx[0][0].makeLimitOrder(order);
                    // @ts-ignore
                    console.log(JSON.stringify(tecretary.texchange.assets));
                }
                if (orderbook[BID][0].price.gte(19300)) {
                }
                const order = LimitOrder.from({
                    price: new Big('19123.8'),
                    quantity: new Big(100),
                    length: SHORT,
                    operation: OPEN,
                });
                // console.log(JSON.stringify(order));
                // await ctx[0][0].makeLimitOrder(order);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this.locked = false;
            }
        });
    }
    async _start() {
        await this.syncAssets();
    }
    async _stop() {
    }
    async syncAssets() {
        this.assets = await this.ctx[0][0].getAssets();
    }
}
const tecretary = new Tecretary(Strategy, {
    DB_FILE_PATH: '/home/zim/Downloads/secretary-test.db',
    initialBalance: new Big(100),
    leverage: 1,
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
tecretary.start().then(() => {
    // @ts-ignore
    tecretary.texchange.settlementPrice = new Big(19123);
});
//# sourceMappingURL=test.js.map