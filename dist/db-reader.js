import Database from 'promisified-sqlite';
import Startable from 'startable';
import { BID, ASK, } from './interfaces';
const LIMIT = 10000;
function parse(stringified) {
    return {
        [BID]: JSON.parse(stringified.bids),
        [ASK]: JSON.parse(stringified.asks),
        time: stringified.time,
    };
}
class AsyncForwardIterator {
    constructor(i) {
        this.i = i;
    }
    async next() {
        const nextItem = await this.i.next();
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
            const trades = await this.db.sql(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!trades.length)
                break;
            for (const trade of trades)
                yield trade;
        }
    }
    getTrades() {
        return new AsyncForwardIterator(this.getTradesIterator());
    }
    async *getOrderbooksIterator() {
        for (let i = 1;; i += LIMIT) {
            const orderbooks = await this.db.sql(`
                SELECT * FROM orderbook
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
            SELECT MIN(time) AS "0" FROM orderbook
        ;`))[0][0];
        const tradesMinTime = (await this.db.sql(`
            SELECT MIN(time) AS "0" FROM trades
        ;`))[0][0];
        return Math.min(orderbooksMinTime, tradesMinTime);
    }
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
//# sourceMappingURL=db-reader.js.map