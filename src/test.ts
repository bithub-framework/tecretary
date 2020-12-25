import {
    Startable,
    adaptor,
} from 'startable';
import {
    Tecretary,
    ContextLike,
    LONG, SHORT,
    OPEN, CLOSE,
    BID, ASK,
    Assets,
    LimitOrder,
} from './index';
import Big from 'big.js';

function f(x: unknown) {
    return JSON.parse(JSON.stringify(x));
}

class Strategy extends Startable {
    private assets?: Assets;
    private locked = false;
    private count = 0;

    constructor(private ctx: ContextLike) {
        super();
        // ctx[0].on('orderbook', orderbook =>
        //     void console.log(f(orderbook)));
        // ctx[0].on('trades', trades =>
        //     void console.log(f(trades)));

        ctx[0].on('orderbook', async orderbook => {
            try {
                if (++this.count % 1000 === 0) {
                    console.log(this.count);
                }

                if (this.locked) return;
                this.locked = true;
                // console.log(JSON.stringify(orderbook));
                // if (orderbook[ASK][0].price.lte(19200)) {
                //     let order: LimitOrder;
                //     order = LimitOrder.from({
                //         price: new Big(19200),
                //         quantity: this.assets!.position[SHORT],
                //         length: SHORT,
                //         operation: CLOSE
                //     });
                //     if (order.quantity.gt(0)) {
                //         console.log(JSON.stringify(order));
                //         await this.ctx[0][0].makeLimitOrder(order);
                //     }

                //     order = LimitOrder.from({
                //         price: new Big(19200),
                //         quantity: this.assets!.reserve.div(19200).times(1000)
                //             .round(0),
                //         length: LONG,
                //         operation: OPEN,
                //     });
                //     console.log(f(order));
                //     await this.ctx[0][0].makeLimitOrder(order);
                //     // @ts-ignore
                //     console.log(JSON.stringify(tecretary.texchange.assets));
                // }

                // if (orderbook[BID][0].price.gte(19300)) {

                // }

                // const order = LimitOrder.from({
                //     price: new Big('19123.8'),
                //     quantity: new Big(100),
                //     length: SHORT,
                //     operation: OPEN,
                // });
                // console.log(JSON.stringify(order));
                // await ctx[0][0].makeLimitOrder(order);
            } catch (err) {
                console.error(err);
            } finally {
                this.locked = false;
            }
        });
    }

    protected async _start() {
        await this.syncAssets();
    }

    protected async _stop() {

    }

    private async syncAssets() {
        this.assets = await this.ctx[0][0].getAssets();
    }
}

const tecretary = new Tecretary(
    Strategy,
    {
        DB_FILE_PATH: '/home/zim/Downloads/hour.db',
        initialBalance: new Big(100),
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
    }
);

adaptor(tecretary);

tecretary.start().then(() => {
    // @ts-ignore
    // tecretary.texchange.settlementPrice = new Big(19123);
});
