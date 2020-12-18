import { Startable } from 'startable';
import { DbReader } from './db-reader';
import { Context } from './context';
import Texchange from 'texchange';
import Forward from './forward';
class Tecretary extends Startable {
    constructor(Strategy, config) {
        super();
        this.Strategy = Strategy;
        this.config = config;
        this.next = async () => {
            if (this.orderbooksIterator.current.time < this.forward.now) {
                const orderbook = this.orderbooksIterator.current;
                this.forward.setTimeout(() => {
                    this.texchange.updateOrderbook(orderbook);
                }, orderbook.time - this.forward.now);
                await this.orderbooksIterator.next();
            }
            if (this.tradesIterator.current.time < this.forward.now) {
                const trades = [];
                const time = this.tradesIterator.current.time;
                while (this.tradesIterator.current.time === time) {
                    trades.push(this.tradesIterator.current);
                    await this.tradesIterator.next();
                }
                this.forward?.setTimeout(() => {
                    this.texchange.updateTrades(trades);
                }, time - this.forward.now);
            }
            this.forward.next();
        };
        this.dbReader = new DbReader(config.DB_FILE_PATH);
    }
    async _start() {
        await this.dbReader.start(err => void this.stop(err).catch(() => { }));
        const minTime = await this.dbReader.getMinTime();
        this.forward = new Forward(minTime);
        this.texchange = new Texchange(this.config, this.forward.sleep, () => this.forward.now);
        this.context = new Context(this.texchange, this.forward.sleep, this.next);
        this.strategy = new this.Strategy(this.context);
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
        this.orderbooksIterator = this.dbReader.getOrderbooks();
        this.tradesIterator = this.dbReader.getTrades();
        await this.orderbooksIterator.next();
        await this.tradesIterator.next();
        this.next().catch(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.strategy.stop();
        await this.dbReader.stop();
    }
}
export { Tecretary as default, Tecretary, };
//# sourceMappingURL=tecretary.js.map