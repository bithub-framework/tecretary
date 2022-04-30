import {
    RawBookOrder,
    RawTrade,
} from './raw-data';
import { Startable } from 'startable';
import Database = require('better-sqlite3');
import {
    HStatic, HLike,
    Side,
    BookOrder,
} from 'interfaces';
import { DatabaseOrderbook } from 'texchange/build/use-cases.d/update-orderbook';
import { DatabaseTrade } from 'texchange/build/use-cases.d/update-trades';
import { AdminTex } from 'texchange/build/texchange';
import assert = require('assert');


export class DatabaseReader<H extends HLike<H>> {
    private db: Database.Database;
    public startable = new Startable(
        () => this.start(),
        () => this.stop(),
    );

    public constructor(
        filePath: string,
        private H: HStatic<H>,
        private adminTexMap: Map<string, AdminTex<H>>,
    ) {
        this.db = new Database(filePath, {
            readonly: true,
            fileMustExist: true,
        });
    }

    public getDatabaseTradeGroups(
        marketName: string,
        afterTradeId?: number,
    ): IterableIterator<DatabaseTrade<H>[]> {
        const adminTex = this.adminTexMap.get(marketName);
        assert(adminTex);

        const rawTrades = typeof afterTradeId !== 'undefined'
            ? this.getRawTradesAfterTradeId(
                marketName,
                afterTradeId,
            ) : this.getRawTrades(
                marketName,
            );

        const databaseTrades = this.databaseTradesFromRawTrades(
            rawTrades,
            adminTex,
        );

        const databaseTradeGroups = this.databaseTradeGroupsFromDatabaseTrades(
            databaseTrades,
        );

        return databaseTradeGroups;
    }

    private *databaseTradeGroupsFromDatabaseTrades(
        trades: IterableIterator<DatabaseTrade<H>>,
    ): Generator<DatabaseTrade<H>[], void> {
        let $group: DatabaseTrade<H>[] = [];
        for (const trade of trades) {
            if (
                $group.length > 0 &&
                $group[0].time !== trade.time
            ) {
                yield $group;
                $group = [];
            }
            $group.push(trade);
        }
        if ($group.length > 0)
            yield $group;
    }

    private *databaseTradesFromRawTrades(
        rawTrades: IterableIterator<RawTrade>,
        adminTex: AdminTex<H>,
    ): Generator<DatabaseTrade<H>, void> {
        for (const rawTrade of rawTrades) {
            yield {
                price: new this.H(rawTrade.price).round(adminTex.config.market.PRICE_DP),
                quantity: new this.H(rawTrade.quantity).round(adminTex.config.market.QUANTITY_DP),
                side: rawTrade.side,
                id: rawTrade.id.toString(),
                time: rawTrade.time,
            };
        }
    }

    private getRawTrades(
        marketName: string,
    ): IterableIterator<RawTrade> {
        return this.db.prepare(`
            SELECT
                name AS marketName,
                CAST(price AS CHAR) AS price,
                CAST(quantity AS CHAR) AS quantity,
                side,
                time
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
            ORDER BY time
        ;`).iterate(
            marketName,
        );
    }

    private getRawTradesAfterTradeId(
        marketName: string,
        afterTradeId: number,
    ): IterableIterator<RawTrade> {
        const afterTime: number = this.db.prepare(`
            SELECT time
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
                AND trades.id = ?
        ;`).get(
            marketName,
            afterTradeId,
        ).time;

        return this.db.prepare(`
            SELECT
                markets.name AS marketName,
                CAST(price AS CHAR) AS price,
                CAST(quantity AS CHAR) AS quantity,
                side,
                time,
                id
            FROM trades, markets
            WHERE trades.mid = markets.id
                AND markets.name = ?
                AND (
                    trades.time = ? AND trades.id > ?
                    OR trades.time > ?
                )
            ORDER BY time
        ;`).iterate(
            marketName,
            afterTime,
            afterTradeId,
            afterTime,
        );
    }

    public getDatabaseOrderbooks(
        marketName: string,
        afterOrderbookId?: number,
    ): IterableIterator<DatabaseOrderbook<H>> {
        const adminTex = this.adminTexMap.get(marketName);
        assert(adminTex);

        const rawBookOrders = typeof afterOrderbookId !== 'undefined'
            ? this.getRawBookOrdersAfterOrderbookId(
                marketName,
                afterOrderbookId,
            ) : this.getRawBookOrders(
                marketName,
            );

        const rawBookOrderGroups = this.rawBookOrderGroupsFromRawBookOrders(
            rawBookOrders,
        );

        const datavaseOrderbooks = this.databaseOrderbooksFromRawBookOrderGroups(
            rawBookOrderGroups,
            adminTex,
        );

        return datavaseOrderbooks;
    }

    private *rawBookOrderGroupsFromRawBookOrders(
        rawBookOrders: IterableIterator<RawBookOrder>,
    ): Generator<RawBookOrder[], void> {
        let $group: RawBookOrder[] = [];
        for (const rawBookOrder of rawBookOrders) {
            if ($group.length > 0 && rawBookOrder.id !== $group[0].id) {
                yield $group;
                $group = [];
            }
            $group.push(rawBookOrder);
        }
        if ($group.length > 0)
            yield $group;
    }

    private *databaseOrderbooksFromRawBookOrderGroups(
        groups: IterableIterator<RawBookOrder[]>,
        adminTex: AdminTex<H>,
    ): Generator<DatabaseOrderbook<H>, void> {
        for (const group of groups) {
            const asks: BookOrder<H>[] = group
                .filter(order => order.side === Side.ASK)
                .map(order => ({
                    price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
                    quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
                    side: order.side,
                }));
            const bids = group
                .filter(order => order.side === Side.BID)
                .map(order => ({
                    price: new this.H(order.price).round(adminTex.config.market.PRICE_DP),
                    quantity: new this.H(order.quantity).round(adminTex.config.market.QUANTITY_DP),
                    side: order.side,
                }));
            yield {
                id: group[0].id.toString(),
                time: group[0].time,
                [Side.ASK]: asks,
                [Side.BID]: bids,
            }
        }
    }

    private getRawBookOrders(
        marketName: string,
    ): IterableIterator<RawBookOrder> {
        return this.db.prepare(`
            SELECT
                markets.name AS marketName
                time,
                CAST(price AS TEXT),
                CAST(quantity AS TEXT),
                side,
                bid AS id
            FROM markets, orderbooks, book_orders
            WHERE markets.id = orderbooks.mid
                AND orderbooks.id = book_orders.bid
                AND markets.name = ?
            ORDER BY time, bid, price
        ;`).iterate(
            marketName,
        );
    }

    private getRawBookOrdersAfterOrderbookId(
        marketName: string,
        afterOrderbookId: number,
    ): IterableIterator<RawBookOrder> {
        const afterTime: number = this.db.prepare(`
            SELECT time
            FROM orderbooks, markets
            WHERE orderbooks.mid = markets.id
                AND markets.name = ?
                AND orderbooks.id = ?
        ;`).get(
            marketName,
            afterOrderbookId,
        ).time;

        return this.db.prepare(`
            SELECT
                markets.name AS marketName
                time,
                CAST(price AS TEXT),
                CAST(quantity AS TEXT),
                side,
                bid AS id
            FROM markets, orderbooks, book_orders
            WHERE markets.id = orderbooks.mid
                AND orderbooks.id = book_orders.bid
                AND markets.name = ?
                AND (
                    orderbooks.time = ? AND orderbooks.id > ?
                    OR orderbooks.time > ?
                )
            ORDER BY time, bid, price
        ;`).iterate(
            marketName,
            afterOrderbookId,
            afterOrderbookId,
            afterTime,
        );
    }

    private async start(): Promise<void> {

    }

    private async stop(): Promise<void> {
        this.db.close();
    }
}
