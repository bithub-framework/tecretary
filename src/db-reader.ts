import Database from 'promisified-sqlite';
import Startable from 'startable';
import {
    Trade,
    Orderbook,
} from './interfaces';

const LIMIT = 10000;

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

    private async * getTradesIterator(): AsyncIterator<Trade> {
        for (let i = 1; ; i += LIMIT) {
            const trades = await this.db.sql<Trade>(`
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

    private async * getOrderbookIterator(): AsyncIterator<Orderbook> {
        for (let i = 1; ; i += LIMIT) {
            const orderbooks = await this.db.sql<Orderbook>(`
                SELECT * FROM orderbook
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!orderbooks.length) break;
            for (const orderbook of orderbooks) yield orderbook;
        }
    }

    public getOrderbook() {
        return new AsyncForwardIterator(this.getOrderbookIterator());
    }

    protected async _start() {
        await this.db.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop() {
        await this.db.stop();
    }
}

export {
    DbReader as default,
    DbReader,
}
