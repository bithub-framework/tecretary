import Database from 'promisified-sqlite';
import Startable from 'startable';
import { BID, ASK, } from './interfaces';
import Big from 'big.js';
import { PRICE_DP, QUANTITY_DP, } from 'texchange';
// TODO
const LIMIT = 1;
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
            const numberizedRawTrades = await this.db.sql(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!numberizedRawTrades.length)
                break;
            for (const numberizedRawTrade of numberizedRawTrades)
                yield {
                    ...numberizedRawTrade,
                    price: new Big(numberizedRawTrade.price.toFixed(PRICE_DP)),
                    quantity: new Big(numberizedRawTrade.price.toFixed(QUANTITY_DP)),
                    side: numberizedRawTrade.side === 'BUY' ? BID : ASK,
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
            for (const orderbook of orderbooks) {
                const asks = JSON.parse(orderbook.asks);
                const bids = JSON.parse(orderbook.bids);
                yield {
                    [ASK]: asks.map(([_price, _quantity]) => ({
                        price: new Big(_price.toFixed(PRICE_DP)),
                        quantity: new Big(_quantity.toFixed(QUANTITY_DP)),
                        side: ASK,
                    })),
                    [BID]: bids.map(([_price, _quantity]) => ({
                        price: new Big(_price.toFixed(PRICE_DP)),
                        quantity: new Big(_quantity.toFixed(QUANTITY_DP)),
                        side: BID,
                    })),
                    time: orderbook.time,
                };
            }
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