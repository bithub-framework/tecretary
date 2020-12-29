import Database from 'promisified-sqlite';
import Startable from 'startable';
import {
    Orderbook,
    BID, ASK,
    RawTrade,
    Config,
} from './interfaces';
import Big from 'big.js';
import { LIMIT } from './config';
import { find, whereEq } from 'ramda';
import assert from 'assert';

interface DatabaseRawTrade {
    price: number;
    quantity: number;
    side: string;
    time: number;
}

interface DatabaseOrderbook {
    time: number;
    bids: string;
    asks: string;
}

interface TableInfo {
    name: string;
    type: string;
    notnull: 0 | 1,
}

class AsyncForwardIterator<T> implements AsyncIterator<T> {
    public current?: T;

    constructor(private i: AsyncIterator<T>) { }

    public async next() {
        const nextItem = await this.i.next();
        if (nextItem.done)
            this.current = undefined;
        else
            this.current = nextItem.value;
        return nextItem;
    }
}

class DbReader extends Startable {
    private db: Database;

    constructor(private config: Config) {
        super();
        this.db = new Database(config.DB_FILE_PATH);
    }

    private async * getTradesIterator(after?: number): AsyncIterator<RawTrade> {
        for (let i = 1; ; i += LIMIT) {
            const dbRawTrades = typeof after === 'number'
                ? await this.db.sql<DatabaseRawTrade>(`
                    SELECT * FROM trades
                    WHERE time >= ${after}
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`)
                : await this.db.sql<DatabaseRawTrade>(`
                    SELECT * FROM trades
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`);
            if (!dbRawTrades.length) break;
            for (const dbRawTrade of dbRawTrades)
                yield this.dbRawTrade2RawTrade(dbRawTrade);
        }
    }

    public getTrades(after?: number) {
        return new AsyncForwardIterator(this.getTradesIterator(after));
    }

    private async * getOrderbooksIterator(after?: number): AsyncIterator<Orderbook> {
        for (let i = 1; ; i += LIMIT) {
            const dbOrderbooks = typeof after === 'number'
                ? await this.db.sql<DatabaseOrderbook>(`
                    SELECT * FROM orderbooks
                    WHERE time >= ${after}
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`)
                : await this.db.sql<DatabaseOrderbook>(`
                    SELECT * FROM orderbooks
                    ORDER BY time
                    LIMIT ${LIMIT} OFFSET ${i}
                ;`);
            if (!dbOrderbooks.length) break;
            for (const dbOrderbook of dbOrderbooks)
                yield this.dbOrderbook2Orderbook(dbOrderbook);
        }
    }

    public getOrderbooks(after?: number) {
        return new AsyncForwardIterator(this.getOrderbooksIterator(after));
    }

    protected async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
        await this.validateTables();
        await this.validateOrderbook();
    }

    protected async _stop() {
        await this.db.stop();
    }

    public async getMinTime(): Promise<number> {
        type DatabaseMinTime = { min_time: number };
        const orderbooksMinTime = (await this.db.sql<DatabaseMinTime>(`
            SELECT MIN(time) AS min_time FROM orderbooks
        ;`))[0]['min_time'];
        const tradesMinTime = (await this.db.sql<DatabaseMinTime>(`
            SELECT MIN(time) AS min_time FROM trades
        ;`))[0]['min_time'];
        assert(orderbooksMinTime !== null);
        if (tradesMinTime !== null)
            return Math.min(orderbooksMinTime, tradesMinTime);
        else return orderbooksMinTime;
    }

    private async validateTables() {
        const tradesTableInfo = await this.db.sql<TableInfo>(`
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
        const orderbooksTableInfo = await this.db.sql<TableInfo>(`
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

    private async validateOrderbook() {
        const orderbooks = (await this.db.sql<Pick<DatabaseOrderbook, 'bids' | 'asks'>>(`
            SELECT bids, asks FROM orderbooks
            LIMIT 1
        ;`));
        if (!orderbooks.length) return;
        const orderbook = orderbooks[0];
        const bids = JSON.parse(orderbook.bids);
        assert(bids instanceof Array);
        assert(bids[0] instanceof Array);
        assert(typeof bids[0][0] === 'number');
        assert(typeof bids[0][1] === 'number');
    }

    private dbRawTrade2RawTrade(dbRawTrade: DatabaseRawTrade): RawTrade {
        return {
            ...dbRawTrade,
            price: new Big(dbRawTrade.price.toFixed(this.config.PRICE_DP)),
            quantity: new Big(dbRawTrade.price.toFixed(this.config.QUANTITY_DP)),
            side: dbRawTrade.side === 'BUY' ? BID : ASK,
        }
    }

    private dbOrderbook2Orderbook(dbOrderbook: DatabaseOrderbook): Orderbook {
        type A = [number, number][];
        const asks: A = JSON.parse(dbOrderbook.asks);
        const bids: A = JSON.parse(dbOrderbook.bids);
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

export {
    DbReader as default,
    DbReader,
    AsyncForwardIterator,
}
