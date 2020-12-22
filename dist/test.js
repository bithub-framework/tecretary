import { Startable, adaptor, } from 'startable';
import { Tecretary, LONG, SHORT, } from './index';
import Big from 'big.js';
class Strategy extends Startable {
    constructor(ctx) {
        super();
        this.ctx = ctx;
    }
    async _start() {
    }
    async _stop() {
    }
}
const tecretary = new Tecretary(Strategy, {
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
});
adaptor(tecretary);
//# sourceMappingURL=test.js.map