import Database from 'promisified-sqlite';
import Startable from 'startable';
import { BID, ASK, } from './interfaces';
import Big from 'big.js';
import { LIMIT } from './config';
import { find, whereEq } from 'ramda';
import assert from 'assert';
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
    constructor(config) {
        super();
        this.config = config;
        this.db = new Database(config.DB_FILE_PATH);
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
                    price: new Big(numberizedRawTrade.price.toFixed(this.config.PRICE_DP)),
                    quantity: new Big(numberizedRawTrade.price.toFixed(this.config.QUANTITY_DP)),
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
            for (const stringified of orderbooks) {
                const asks = JSON.parse(stringified.asks);
                const bids = JSON.parse(stringified.bids);
                const orderbook = {
                    [ASK]: asks.map(([_price, _quantity]) => ({
                        price: new Big(_price.toFixed(this.config.PRICE_DP)),
                        quantity: new Big(_quantity.toFixed(this.config.QUANTITY_DP)),
                        side: ASK,
                    })),
                    [BID]: bids.map(([_price, _quantity]) => ({
                        price: new Big(_price.toFixed(this.config.PRICE_DP)),
                        quantity: new Big(_quantity.toFixed(this.config.QUANTITY_DP)),
                        side: BID,
                    })),
                    time: stringified.time,
                };
                yield orderbook;
            }
        }
    }
    getOrderbooks() {
        return new AsyncForwardIterator(this.getOrderbooksIterator());
    }
    async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
        await this.validateTables();
        await this.validateOrderbook();
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
    async validateTables() {
        const tradesTableInfo = await this.db.sql(`
            PRAGMA table_info(trades)
        ;`);
        assert(find(whereEq({
            name: 'price',
            type: 'DECIMAL(12 , 2)',
            notnull: 1,
        }), tradesTableInfo));
        assert(find(whereEq({
            name: 'quantity',
            type: 'DECIMAL(16 , 6)',
            notnull: 1,
        }), tradesTableInfo));
        assert(find(whereEq({
            name: 'side',
            type: 'VARCHAR(4)',
            notnull: 1,
        }), tradesTableInfo));
        assert(find(whereEq({
            name: 'time',
            type: 'BIGINT',
            notnull: 1,
        }), tradesTableInfo));
        const orderbooksTableInfo = await this.db.sql(`
            PRAGMA table_info(orderbooks)
        ;`);
        assert(find(whereEq({
            name: 'asks',
            type: 'CLOB',
            notnull: 1,
        }), orderbooksTableInfo));
        assert(find(whereEq({
            name: 'bids',
            type: 'CLOB',
            notnull: 1,
        }), orderbooksTableInfo));
        assert(find(whereEq({
            name: 'time',
            type: 'BIGINT',
            notnull: 1,
        }), orderbooksTableInfo));
    }
    async validateOrderbook() {
        const orderbooks = (await this.db.sql(`
            SELECT bids, asks FROM orderbooks
            LIMIT 1
        ;`));
        if (!orderbooks.length)
            return;
        const orderbook = orderbooks[0];
        const bids = JSON.parse(orderbook.bids);
        assert(bids instanceof Array);
        assert(bids[0] instanceof Array);
        assert(typeof bids[0][0] === 'number');
        assert(typeof bids[0][1] === 'number');
    }
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
//# sourceMappingURL=db-reader.js.map