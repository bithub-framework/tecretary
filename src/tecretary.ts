import { Startable, StartableLike } from 'startable';
import { DbReader, AsyncForwardIterator } from './db-reader';
import { Context } from './context';
import Texchange from 'texchange';
import Forward from './forward';
import { Pollerloop, Loop } from 'pollerloop';
import fetch from 'node-fetch';
import {
    Orderbook,
    Config,
    RawTrade,
    StrategyConstructor,
    Assets,
} from './interfaces';
import {
    SECRETARIAT_URL,
} from './config';


class Tecretary extends Startable {
    private dbReader: DbReader;
    private strategy!: StartableLike;
    private forward!: Forward;
    private texchange!: Texchange;
    private context!: Context;
    private orderbooksIterator!: AsyncForwardIterator<Orderbook>;
    private tradesIterator!: AsyncForwardIterator<RawTrade>;
    private pollerloop: Pollerloop;

    constructor(
        private Strategy: StrategyConstructor,
        private config: Config,
    ) {
        super();
        this.dbReader = new DbReader(config);
        this.pollerloop = new Pollerloop(this.loop);
    }

    protected async _start() {
        await this.dbReader.start(err => void this.stop(err).catch(() => { }));
        const dbMinTime = await this.dbReader.getMinTime();
        const res = await fetch(
            `${SECRETARIAT_URL}/assets/latest?id=${this.config.projectId}`);
        if (res.ok) this.config.initialAssets = <Assets>await res.json();
        const startingTime = Math.max(dbMinTime, this.config.initialAssets.time);
        this.forward = new Forward(startingTime);
        this.texchange = new Texchange(
            this.config,
            this.forward.sleep,
            this.forward.now,
        );
        this.context = new Context(
            this.texchange,
            this.forward.sleep,
            this.forward.now,
            this.forward.escape,
        );
        this.strategy = new this.Strategy(this.context);
        this.orderbooksIterator = this.dbReader.getOrderbooks(startingTime);
        await this.orderbooksIterator.next();
        this.tradesIterator = this.dbReader.getTrades(startingTime);
        await this.tradesIterator.next();
        await this.pollerloop.start(err => void this.stop(err).catch(() => { }));
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop(err?: Error) {
        await this.strategy.stop(err);
        await this.pollerloop.stop();
        await this.dbReader.stop();
    }

    private loop: Loop = async sleep => {
        await sleep(0);
        while (true) {
            const now = this.forward.now();
            let nextTime = this.forward.getNextTime();

            if (
                this.orderbooksIterator.current &&
                this.orderbooksIterator.current.time <= nextTime
            ) {
                const orderbook = this.orderbooksIterator.current;
                this.forward.setTimeout(() => {
                    this.texchange.updateOrderbook(orderbook);
                }, orderbook.time - now);
                await this.orderbooksIterator.next();
            }

            if (
                this.tradesIterator.current &&
                this.tradesIterator.current.time <= nextTime
            ) {
                const trades: RawTrade[] = [];
                const time = this.tradesIterator.current.time;
                while (this.tradesIterator.current?.time === time) {
                    trades.push(this.tradesIterator.current);
                    await this.tradesIterator.next();
                }
                this.forward.setTimeout(() => {
                    this.texchange.updateTrades(trades);
                }, time - now);
            }

            nextTime = this.forward.getNextTime();
            if (nextTime === Number.POSITIVE_INFINITY)
                this.stop().catch(() => { });
            await sleep(0);
            await this.forward.next();
        }
    }
}

export {
    Tecretary as default,
    Tecretary,
}
