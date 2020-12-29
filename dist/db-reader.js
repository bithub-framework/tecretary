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
    async *getTradesIterator(after) {
        for (let i = 1;; i += LIMIT) {
            const dbRawTrades = typeof after === 'number'
                ? await this.db.sql(`
                    SELECT * FROM trades
                    WHERE time >= ${after}
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`)
                : await this.db.sql(`
                    SELECT * FROM trades
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`);
            if (!dbRawTrades.length)
                break;
            for (const dbRawTrade of dbRawTrades)
                yield this.dbRawTrade2RawTrade(dbRawTrade);
        }
    }
    getTrades(after) {
        return new AsyncForwardIterator(this.getTradesIterator(after));
    }
    async *getOrderbooksIterator(after) {
        for (let i = 1;; i += LIMIT) {
            const dbOrderbooks = typeof after === 'number'
                ? await this.db.sql(`
                    SELECT * FROM orderbooks
                    WHERE time >= ${after}
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`)
                : await this.db.sql(`
                    SELECT * FROM orderbooks
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`);
            if (!dbOrderbooks.length)
                break;
            for (const dbOrderbook of dbOrderbooks)
                yield this.dbOrderbook2Orderbook(dbOrderbook);
        }
    }
    getOrderbooks(after) {
        return new AsyncForwardIterator(this.getOrderbooksIterator(after));
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
            SELECT MIN(time) AS min_time FROM orderbooks
        ;`))[0]['min_time'];
        const tradesMinTime = (await this.db.sql(`
            SELECT MIN(time) AS "0" FROM trades
        ;`))[0]['min_time'];
        assert(typeof orderbooksMinTime === 'number');
        if (typeof tradesMinTime === 'number')
            return Math.min(orderbooksMinTime, tradesMinTime);
        else
            return orderbooksMinTime;
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
    dbRawTrade2RawTrade(dbRawTrade) {
        return {
            ...dbRawTrade,
            price: new Big(dbRawTrade.price.toFixed(this.config.PRICE_DP)),
            quantity: new Big(dbRawTrade.price.toFixed(this.config.QUANTITY_DP)),
            side: dbRawTrade.side === 'BUY' ? BID : ASK,
        };
    }
    dbOrderbook2Orderbook(dbOrderbook) {
        const asks = JSON.parse(dbOrderbook.asks);
        const bids = JSON.parse(dbOrderbook.bids);
        return {
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
            time: dbOrderbook.time,
        };
    }
}
export { DbReader as default, DbReader, AsyncForwardIterator, };
//# sourceMappingURL=db-reader.js.map