import Database from 'promisified-sqlite';
import Startable from 'startable';
import { BID, ASK, } from './interfaces';
import Big from 'big.js';
const LIMIT = 10000;
function parse(stringified) {
    return {
        [BID]: JSON.parse(stringified.bids, (k, v) => {
            if (k !== '') {
                const makerOrder = {
                    price: new Big(v[0]),
                    quantity: new Big(v[1]),
                    side: BID,
                };
                return makerOrder;
            }
            else
                return v;
        }),
        [ASK]: JSON.parse(stringified.asks, (k, v) => {
            if (k !== '') {
                const makerOrder = {
                    price: new Big(v[0]),
                    quantity: new Big(v[1]),
                    side: ASK,
                };
                return makerOrder;
            }
            else
                return v;
        }),
        time: stringified.time,
    };
}
class AsyncForwardIterator {
    constructor(i) {
        this.i = i;
    }
    async next() {
        const nextItem = await this.i.next();
        if (nextItem.done)
            this.current = undefined;
        else
            this.current = nextItem.value;
        return nextItem;
    }
}
class DbReader extends Startable {
    constructor(filePath) {
        super();
        this.db = new Database(filePath);
    }
    async *getTradesIterator() {
        for (let i = 1;; i += LIMIT) {
            const rawTrades = await this.db.sql(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!rawTrades.length)
                break;
            for (const rawTrade of rawTrades)
                yield {
                    ...rawTrade,
                    price: new Big(rawTrade.price),
                    quantity: new Big(rawTrade.price),
                };
        }
    }
    getTrades() {
        return new AsyncForwardIterator(this.getTradesIterator());
    }
    async *getOrderbooksIterator() {
        for (let i = 1;; i += LIMIT) {
            const orderbooks = await this.db.sql(`
                SELECT * FROM orderbooks
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!orderbooks.length)
                break;
            for (const orderbook of orderbooks)
                yield parse(orderbook);
        }
    }
    getOrderbooks() {
        return new AsyncForwardIterator(this.getOrderbooksIterator());
    }
    async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.db.stop();
    }
    async getMinTime() {
        const orderbooksMinTime = (await this.db.sql(`
            SELECT MIN(time) AS "0" FROM orderbooks
        ;`))[0][0];
        const tradesMinTime = (await this.db.sql(`
            SELECT MIN(time) AS "0" FROM trades
        ;`))[0][0];
        return Math.min(orderbooksMinTime, tradesMinTime);
    }
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
//# sourceMappingURL=db-reader.js.map