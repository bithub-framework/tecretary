import { RawOrderbook, RawTrade } from './raw-data';
import { find, whereEq } from 'ramda';


// interface DatabaseOrderbook {
//     time: number;
//     bids: string;
//     asks: string;
// }

// interface TableInfo {
//     name: string;
//     type: string;
//     notnull: 0 | 1,
// }

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

export class DatabaseReader {
    // private async * getTradesIterator(after?: number): AsyncIterator<UnidentifiedTrade> {
    //     for (let i = 1; ; i += LIMIT) {
    //         const stringifiedRawTrades = typeof after === 'number'
    //             ? await this.db.sql<StringifiedRawTrade>(`
    //                 SELECT
    //                     CAST(price AS CHAR) AS price,
    //                     CAST(quantity AS CHAR) AS quantity,
    //                     CASE
    //                         WHEN side = 'BUY' THEN 1 ELSE -1
    //                     END AS side,
    //                     time
    //                 FROM trades
    //                 WHERE time >= ${after}
    //                 ORDER BY time
    //                 LIMIT ${LIMIT} OFFSET ${i}
    //             ;`)
    //             : await this.db.sql<StringifiedRawTrade>(`
    //                 SELECT
    //                     CAST(price AS CHAR) AS price,
    //                     CAST(quantity AS CHAR) AS quantity,
    //                     CASE
    //                         WHEN side = 'BUY' THEN 1 ELSE -1
    //                     END AS side,
    //                     time
    //                 FROM trades
    //                 ORDER BY time
    //                 LIMIT ${LIMIT} OFFSET ${i}
    //             ;`);
    //         if (!stringifiedRawTrades.length) break;
    //         for (const stringifiedRawTrade of stringifiedRawTrades) {
    //             const rawTrade = JSON.parse(
    //                 JSON.stringify(stringifiedRawTrade),
    //                 reviver,
    //             );
    //             yield {
    //                 price: rawTrade.price.round(this.config.PRICE_DP),
    //                 quantity: rawTrade.quantity.round(this.config.QUANTITY_DP),
    //                 side: rawTrade.side,
    //                 time: rawTrade.time,
    //             };
    //         }
    //     }
    // }

    public getTradeIterator(after?: number): AsyncIterableIterator<RawTrade> {

    }

    // private async * getOrderbooksIterator(after?: number): AsyncIterator<Orderbook> {
    //     for (let i = 1; ; i += LIMIT) {
    //         const dbOrderbooks = typeof after === 'number'
    //             ? await this.db.sql<DatabaseOrderbook>(`
    //                 SELECT * FROM orderbooks
    //                 WHERE time >= ${after}
    //                 ORDER BY time
    //                 LIMIT ${LIMIT} OFFSET ${i}
    //             ;`)
    //             : await this.db.sql<DatabaseOrderbook>(`
    //                 SELECT * FROM orderbooks
    //                 ORDER BY time
    //                 LIMIT ${LIMIT} OFFSET ${i}
    //             ;`);
    //         if (!dbOrderbooks.length) break;
    //         for (const dbOrderbook of dbOrderbooks)
    //             yield this.dbOrderbook2Orderbook(dbOrderbook);
    //     }
    // }

    public getOrderbookIterator(after?: number): AsyncIterableIterator<RawOrderbook> {

    }

    // private async validateTables() {
    //     const tradesTableInfo = await this.db.sql<TableInfo>(`
    //         PRAGMA table_info(trades)
    //     ;`);
    //     assert(find(whereEq({
    //         name: 'price',
    //         type: 'DECIMAL(12 , 2)',
    //         notnull: 1,
    //     }), tradesTableInfo));
    //     assert(find(whereEq({
    //         name: 'quantity',
    //         type: 'DECIMAL(16 , 6)',
    //         notnull: 1,
    //     }), tradesTableInfo));
    //     assert(find(whereEq({
    //         name: 'side',
    //         type: 'VARCHAR(4)',
    //         notnull: 1,
    //     }), tradesTableInfo));
    //     assert(find(whereEq({
    //         name: 'time',
    //         type: 'BIGINT',
    //         notnull: 1,
    //     }), tradesTableInfo));
    //     const orderbooksTableInfo = await this.db.sql<TableInfo>(`
    //         PRAGMA table_info(orderbooks)
    //     ;`);
    //     assert(find(whereEq({
    //         name: 'asks',
    //         type: 'JSON',
    //         notnull: 1,
    //     }), orderbooksTableInfo));
    //     assert(find(whereEq({
    //         name: 'bids',
    //         type: 'JSON',
    //         notnull: 1,
    //     }), orderbooksTableInfo));
    //     assert(find(whereEq({
    //         name: 'time',
    //         type: 'BIGINT',
    //         notnull: 1,
    //     }), orderbooksTableInfo));
    // }

    // private async validateOrderbook() {
    //     const orderbooks = (await this.db.sql<Pick<DatabaseOrderbook, 'bids' | 'asks'>>(`
    //         SELECT bids, asks FROM orderbooks
    //         LIMIT 1
    //     ;`));
    //     if (!orderbooks.length) return;
    //     const orderbook = orderbooks[0];
    //     const bids = JSON.parse(orderbook.bids);
    //     assert(bids instanceof Array);
    //     assert(bids[0] instanceof Array);
    //     assert(typeof bids[0][0] === 'number');
    //     assert(typeof bids[0][1] === 'number');
    // }

}
