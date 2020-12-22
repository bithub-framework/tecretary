import {
    Startable,
    adaptor,
} from 'startable';
import {
    Tecretary,
    ContextLike,
    LONG, SHORT,
} from './index';
import Big from 'big.js';

class Strategy extends Startable {
    constructor(private ctx: ContextLike) {
        super();
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
                [LONG]: new Big('0'), [SHORT]: new Big('0'),
            },
            leverage: 10,
            balance: new Big('100'),
            cost: {
                [LONG]: new Big('0'), [SHORT]: new Big('0'),
            },
            frozen: new Big('0'),
            margin: new Big('0'),
            reserve: new Big('100'),
        },
        PING: 10,
        PROCESSING: 10,
        MAKER_FEE: .01,
        TAKER_FEE: .01,
    }
);

adaptor(tecretary);
