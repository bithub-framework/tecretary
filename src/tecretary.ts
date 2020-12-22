import { Startable, StartableLike } from 'startable';
import { DbReader, AsyncForwardIterator } from './db-reader';
import { Context } from './context';
import Texchange from 'texchange';
import Forward from './forward';
import { Pollerloop, Loop } from 'pollerloop';
import {
    Orderbook,
    Config,
    RawTrade,
    StrategyConstructor,
} from './interfaces';

const NEXT_INTERVAL = 10;

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
        const minTime = await this.dbReader.getMinTime();
        this.forward = new Forward(minTime);
        this.texchange = new Texchange(
            this.config,
            this.forward.sleep,
            () => this.forward.now,
        );
        this.context = new Context(
            this.texchange,
            this.forward.sleep,
            () => this.forward.now,
        );
        this.strategy = new this.Strategy(this.context);
        this.orderbooksIterator = this.dbReader.getOrderbooks();
        await this.orderbooksIterator.next();
        this.tradesIterator = this.dbReader.getTrades();
        await this.tradesIterator.next();

        await this.strategy.start(err => void this.stop(err).catch(() => { }));
        await this.pollerloop.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop() {
        await this.pollerloop.stop();
        await this.strategy.stop();
        await this.dbReader.stop();
    }

    private loop: Loop = async sleep => {
        while (true) {
            if (
                this.orderbooksIterator.current && (
                    this.forward.nextTime === undefined ||
                    this.orderbooksIterator.current.time <= this.forward.nextTime
                )
            ) {
                const orderbook = this.orderbooksIterator.current;
                this.forward.setTimeout(() => {
                    this.texchange.updateOrderbook(orderbook);
                }, orderbook.time - this.forward.now);
                await this.orderbooksIterator.next();
            }
            if (
                this.tradesIterator.current && (
                    this.forward.nextTime === undefined ||
                    this.tradesIterator.current.time <= this.forward.nextTime
                )
            ) {
                const trades: RawTrade[] = [];
                const time = this.tradesIterator.current.time;
                while (this.tradesIterator.current?.time === time) {
                    trades.push(this.tradesIterator.current);
                    await this.tradesIterator.next();
                }
                this.forward.setTimeout(() => {
                    this.texchange.updateTrades(trades);
                }, time - this.forward.now);
            }
            const nextTime = this.forward.nextTime;
            if (nextTime === undefined) break;
            const delay = Math.min(
                nextTime - this.forward.now,
                NEXT_INTERVAL,
            );
            await sleep(delay);
            this.forward.next();
        }
    }

}

export {
    Tecretary as default,
    Tecretary,
}
