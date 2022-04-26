import { Startable, StartableLike } from 'startable';
import { DatabaseReader } from './database-reader';
import { Context } from './context';
import { Forward } from './forward';
import { OrderId, TradeId } from 'texchange/build/interfaces';
import { Texchange } from 'texchange/build/texchange';
import { AdminTex } from 'texchange/build/texchange';
import { UserTex } from 'texchange/build/texchange';
import { Config } from './config';
import { HLike, HStatic } from 'interfaces';
import { StrategyLike, StrategyStatic } from 'interfaces/build/secretaries/strategy-like';
import { orderbookFromRawOrderbooks } from './orderbook-from-raw-orderbooks';
import { tradesfromRawTrade } from './trades-from-raw-trade';
import { sortMerge } from './merge';
import { DataItem } from './data-item';
import assert = require('assert');



class Tecretary<H extends HLike<H>> {
    private reader: DatabaseReader;
    private strategy: StrategyLike;
    private forward: Forward;
    private context: Context<H>;
    private adminTexMap: Map<string, AdminTex<H>>;
    private userTexes: UserTex<H>[];
    private data: AsyncIterable<DataItem<H>>;

    constructor(
        Strategy: StrategyStatic<H, OrderId, TradeId>,
        config: Config<H>,
        texMap: Map<string, Texchange<H, unknown>>,
        private H: HStatic<H>,
    ) {
        this.adminTexMap = new Map(
            [...texMap].map(
                ([name, tex]) => [name, tex.admin],
            ),
        );

        this.userTexes = config.markets.map(name => {
            const tex = texMap.get(name);
            assert(tex);
            return tex.user;
        });

        this.forward = new Forward(
            config.startTime,
        );

        this.context = new Context<H>(
            this.userTexes,
            this.forward,
        );

        this.strategy = new Strategy(
            this.context,
        );

        const orderbookData = orderbookFromRawOrderbooks(
            this.reader.getOrderbookIterator(),
            this.H,
            this.adminTexMap,
        );

        const tradesData = tradesfromRawTrade(
            this.reader.getTradeIterator(),
            this.H,
            this.adminTexMap,
        );

        this.data = sortMerge<DataItem<H>>(
            (a, b) => a.time - b.time,
        )(
            orderbookData,
            tradesData,
        );
    }

    // protected async _start() {
    //     await this.dbReader.start(err => void this.stop(err).catch(() => { }));
    //     const dbMinTime = await this.dbReader.getMinTime();
    //     this.config.initialAssets =
    //         await this.readInitialAssets() || this.config.initialAssets;
    //     const startingTime = Math.max(dbMinTime, this.config.initialAssets.time);
    //     this.forward = new Forward(startingTime);
    //     this.texchange = new Texchange(
    //         this.config,
    //         this.forward.sleep,
    //         this.forward.now,
    //     );
    //     this.context = new Context(
    //         this.texchange,
    //         this.config,
    //         this.forward.setTimeout,
    //         this.forward.clearTimeout,
    //         this.forward.sleep,
    //         this.forward.now,
    //         this.forward.escape,
    //     );
    //     this.strategy = new this.Strategy(this.context);
    //     this.orderbooksIterator = this.dbReader.getOrderbooks(startingTime);
    //     await this.orderbooksIterator.next();
    //     this.tradesIterator = this.dbReader.getTrades(startingTime);
    //     await this.tradesIterator.next();
    //     await this.pollerloop.start(err => void this.stop(err).catch(() => { }));
    //     await this.strategy.start(err => void this.stop(err).catch(() => { }));
    // }

    // protected async _stop(err?: Error) {
    //     await this.strategy.stop(err);
    //     await this.pollerloop.stop();
    //     await this.dbReader.stop();
    // }

    // private async readInitialAssets(): Promise<InitialAssets | void> {
    //     const res = await fetch(
    //         `${REDIRECTOR_URL}/secretariat/assets/latest?id=${this.config.projectId}`);
    //     if (res.ok) {
    //         const assets = <Assets>JSON.parse(
    //             JSON.stringify(<StringifiedAssets>await res.json()),
    //             reviver,
    //         );
    //         return {
    //             balance: assets.balance,
    //             time: assets.time,
    //         };
    //     }
    // }

    // private loop: Loop = async sleep => {
    //     await sleep(0);
    //     while (true) {
    //         const now = this.forward.now();
    //         let nextTime = this.forward.getNextTime();

    //         if (
    //             this.orderbooksIterator.current &&
    //             this.orderbooksIterator.current.time <= nextTime
    //         ) {
    //             const orderbook = this.orderbooksIterator.current;
    //             this.forward.setTimeout(() => {
    //                 this.texchange.updateOrderbook(orderbook);
    //             }, orderbook.time - now);
    //             await this.orderbooksIterator.next();
    //         }

    //         if (
    //             this.tradesIterator.current &&
    //             this.tradesIterator.current.time <= nextTime
    //         ) {
    //             const trades: UnidentifiedTrade[] = [];
    //             const time = this.tradesIterator.current.time;
    //             while (this.tradesIterator.current?.time === time) {
    //                 trades.push(this.tradesIterator.current);
    //                 await this.tradesIterator.next();
    //             }
    //             this.forward.setTimeout(() => {
    //                 this.texchange.updateTrades(trades);
    //             }, time - now);
    //         }

    //         nextTime = this.forward.getNextTime();
    //         if (nextTime === Number.POSITIVE_INFINITY)
    //             this.stop().catch(() => { });
    //         await sleep(0);
    //         await this.forward.next();
    //     }
    // }
}

export {
    Tecretary as default,
    Tecretary,
}
