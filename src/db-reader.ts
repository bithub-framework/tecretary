import Database from 'promisified-sqlite';
import Startable from 'startable';
import {
    Orderbook,
    BID, ASK,
    RawTrade,
    StringifiedOrderbook,
    NumberizedRawTrade,
    Config,
} from './interfaces';
import Big from 'big.js';

// TODO
const LIMIT = 1;

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

    private async * getTradesIterator(): AsyncIterator<RawTrade> {
        for (let i = 1; ; i += LIMIT) {
            const numberizedRawTrades = await this.db.sql<NumberizedRawTrade>(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!numberizedRawTrades.length) break;
            for (const numberizedRawTrade of numberizedRawTrades) yield {
                ...numberizedRawTrade,
                price: new Big(numberizedRawTrade.price.toFixed(this.config.PRICE_DP)),
                quantity: new Big(numberizedRawTrade.price.toFixed(this.config.QUANTITY_DP)),
                side: numberizedRawTrade.side === 'BUY' ? BID : ASK,
            };
        }
    }

    public getTrades() {
        return new AsyncForwardIterator(this.getTradesIterator());
    }

    private async * getOrderbooksIterator(): AsyncIterator<Orderbook> {
        for (let i = 1; ; i += LIMIT) {
            const orderbooks = await this.db.sql<StringifiedOrderbook>(`
                SELECT * FROM orderbooks
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!orderbooks.length) break;
            for (const orderbook of orderbooks) {
                type A = [number, number][];
                const asks: A = JSON.parse(orderbook.asks);
                const bids: A = JSON.parse(orderbook.bids);
                yield {
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
                    time: orderbook.time,
                };
            }
        }
    }

    public getOrderbooks() {
        return new AsyncForwardIterator(this.getOrderbooksIterator());
    }

    protected async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop() {
        await this.db.stop();
    }

    public async getMinTime(): Promise<number> {
        const orderbooksMinTime = (await this.db.sql<[number]>(`
            SELECT MIN(time) AS "0" FROM orderbooks
        ;`))[0][0];
        const tradesMinTime = (await this.db.sql<[number]>(`
            SELECT MIN(time) AS "0" FROM trades
        ;`))[0][0];
        return Math.min(orderbooksMinTime, tradesMinTime);
    }
}

export {
    DbReader as default,
    DbReader,
    AsyncForwardIterator,
}
