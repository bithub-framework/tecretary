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
            try {
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
            }
            catch (err) {
                this.stop().catch(() => { });
            }
        };
        this.dbReader = new DbReader(config.DB_FILE_PATH);
    }
    async _start() {
        await this.dbReader.start(err => void this.stop(err).catch(() => { }));
        const minTime = await this.dbReader.getMinTime();
        this.forward = new Forward(minTime);
        this.texchange = new Texchange(this.config, this.forward.sleep, () => this.forward.now);
        this.context = new Context(this.texchange, this.forward.sleep);
        this.strategy = new this.Strategy(this.context);
        this.orderbooksIterator = this.dbReader.getOrderbooks();
        await this.orderbooksIterator.next();
        this.tradesIterator = this.dbReader.getTrades();
        await this.tradesIterator.next();
        await this.strategy.start(err => void this.stop(err).catch(() => { }));
        process.on('beforeExit', this.next);
        this.next().catch(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        process.off('beforeExit', this.next);
        await this.strategy.stop();
        await this.dbReader.stop();
    }
}
export { Tecretary as default, Tecretary, };
//# sourceMappingURL=tecretary.js.map