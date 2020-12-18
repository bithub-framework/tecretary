import Database from 'promisified-sqlite';
import Startable from 'startable';
import {
    Trade,
    Orderbook,
    BID, ASK,
    RawTrade,
} from './interfaces';

const LIMIT = 10000;

interface StringifiedOrderbook {
    time: number;
    bids: string;
    asks: string;
}

function parse(stringified: StringifiedOrderbook): Orderbook {
    return {
        [BID]: JSON.parse(stringified.bids),
        [ASK]: JSON.parse(stringified.asks),
        time: stringified.time,
    }
}

class AsyncForwardIterator<T> implements AsyncIterator<T> {
    public current?: T;

    constructor(private i: AsyncIterator<T>) { }

    public async next() {
        const nextItem = await this.i.next();
        this.current = nextItem.value;
        return nextItem;
    }
}

class DbReader extends Startable {
    private db: Database;

    constructor(filePath: string) {
        super();
        this.db = new Database(filePath);
    }

    private async * getTradesIterator(): AsyncIterator<RawTrade> {
        for (let i = 1; ; i += LIMIT) {
            const trades = await this.db.sql<RawTrade>(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!trades.length) break;
            for (const trade of trades) yield trade;
        }
    }

    public getTrades() {
        return new AsyncForwardIterator(this.getTradesIterator());
    }

    private async * getOrderbooksIterator(): AsyncIterator<Orderbook> {
        for (let i = 1; ; i += LIMIT) {
            const orderbooks = await this.db.sql<StringifiedOrderbook>(`
                SELECT * FROM orderbook
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!orderbooks.length) break;
            for (const orderbook of orderbooks) yield parse(orderbook);
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
            SELECT MIN(time) AS "0" FROM orderbook
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
