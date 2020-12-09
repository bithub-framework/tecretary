import Database from 'promisified-sqlite';
import Startable from 'startable';
const LIMIT = 10000;
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
    async *getOrderbookIterator() {
        for (let i = 1;; i += LIMIT) {
            const orderbooks = await this.db.sql(`
                SELECT * FROM orderbook
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!orderbooks.length)
                break;
            for (const orderbook of orderbooks)
                yield orderbook;
        }
    }
    getOrderbook() {
        return new AsyncForwardIterator(this.getOrderbookIterator());
    }
    async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.db.stop();
    }
}
export { DbReader as default, DbReader, };
//# sourceMappingURL=db-reader.js.map