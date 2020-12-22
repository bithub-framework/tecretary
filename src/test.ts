import {
    Startable,
    adaptor,
} from 'startable';
import {
    Tecretary,
    ContextLike,
    LONG, SHORT,
    BID, ASK,
} from './index';
import Big from 'big.js';
import { RoundingMode } from 'big.js';

function f(x: unknown) {
    return JSON.parse(JSON.stringify(x));;
}

class Strategy extends Startable {
    constructor(private ctx: ContextLike) {
        super();
        ctx[0].on('orderbook', orderbook =>
            void console.log(f(orderbook)));
        ctx[0].on('trades', trades =>
            void console.log(f(trades)));

        ctx[0].once('orderbook', async () => {
            try {
                console.log(ctx.now());
                const order = {
                    price: new Big('19123.8'),
                    quantity: new Big(100),
                    side: ASK,
                    open: true,
                };
                await ctx[0][0].makeLimitOrder(order);
                console.log(ctx.now());
                console.log(f(await ctx[0][0].getAssets()));
                console.log(ctx.now());
            } catch (err) {
                console.error(err);
            }
        });
    }

    protected async _start() {

    }

    protected async _stop() {

    }
}

const tecretary = new Tecretary(
    Strategy,
    {
        DB_FILE_PATH: '/home/zim/Downloads/secretary-test.db',
        initialAssets: {
            position: {
                [LONG]: new Big(0), [SHORT]: new Big(0),
            },
            leverage: 10,
            balance: new Big(100000),
            cost: {
                [LONG]: new Big(0), [SHORT]: new Big(0),
            },
            frozen: new Big(0),
            margin: new Big(0),
            reserve: new Big(100000),
        },
        PING: 10,
        PROCESSING: 10,
        MAKER_FEE: .01,
        TAKER_FEE: .01,
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
