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
import { RoundingMode } from 'big.js';

function f(x: unknown) {
    return JSON.parse(JSON.stringify(x));;
}

class Strategy extends Startable {
    private assets?: Assets;

    constructor(private ctx: ContextLike) {
        super();
        // ctx[0].on('orderbook', orderbook =>
        //     void console.log(f(orderbook)));
        // ctx[0].on('trades', trades =>
        //     void console.log(f(trades)));

        ctx[0].on('orderbook', async orderbook => {
            try {
                if (orderbook[ASK][0].price.lte(19200)) {
                    let order: LimitOrder;
                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets!.position[SHORT],
                        length: SHORT,
                        operation: CLOSE
                    });
                    if (order.quantity.gt(0))
                        await this.ctx[0][0].makeLimitOrder(order);

                    order = LimitOrder.from({
                        price: new Big(19200),
                        quantity: this.assets!.reserve.div(19200).times(1000),
                        length: LONG,
                        operation: OPEN,
                    });
                    this.ctx[0][0].makeLimitOrder(order);
                }

                if (orderbook[BID][0].price.gte(19300)) {

                }

                console.log(ctx.now());
                const order = LimitOrder.from({
                    price: new Big('19123.8'),
                    quantity: new Big(100),
                    length: SHORT,
                    operation: OPEN,
                });
                await ctx[0][0].makeLimitOrder(order);
            } catch (err) {
                console.error(err);
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
        DB_FILE_PATH: '/home/zim/Downloads/huobi-test.db',
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
    tecretary.texchange.settlementPrice = new Big(20000);
});
