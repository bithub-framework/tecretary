import Database from 'promisified-sqlite';
import Startable from 'startable';
import {
    Orderbook,
    BID, ASK,
    RawTrade,
    StringifiedOrderbook,
    NumberizedRawTrade,
    MakerOrder,
} from './interfaces';
import Big from 'big.js';

const LIMIT = 10000;

function parse(stringified: StringifiedOrderbook): Orderbook {
    return {
        [BID]: JSON.parse(stringified.bids, (k, v) => {
            if (k !== '') {
                const makerOrder: MakerOrder = {
                    price: new Big((<number[]>v)[0]),
                    quantity: new Big((<number[]>v)[1]),
                    side: BID,
                };
                return makerOrder;
            } else return v;
        }),
        [ASK]: JSON.parse(stringified.asks, (k, v) => {
            if (k !== '') {
                const makerOrder: MakerOrder = {
                    price: new Big((<number[]>v)[0]),
                    quantity: new Big((<number[]>v)[1]),
                    side: ASK,
                };
                return makerOrder;
            } else return v;
        }),
        time: stringified.time,
    }
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

    constructor(filePath: string) {
        super();
        this.db = new Database(filePath);
    }

    private async * getTradesIterator(): AsyncIterator<RawTrade> {
        for (let i = 1; ; i += LIMIT) {
            const rawTrades = await this.db.sql<NumberizedRawTrade>(`
                SELECT * FROM trades
                ORDER BY time
                LIMIT ${LIMIT} OFFSET ${i}
            ;`);
            if (!rawTrades.length) break;
            for (const rawTrade of rawTrades) yield {
                ...rawTrade,
                price: new Big(rawTrade.price),
                quantity: new Big(rawTrade.price),
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
