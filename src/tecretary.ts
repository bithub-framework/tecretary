import {
    Startable,
    StartableLike,
} from 'startable';
import { DbReader } from './db-reader';
import {
    ContextLike,
} from 'secretary';

interface StrategyConstructor {
    new(ctx: ContextLike): StartableLike;
}

class Tecretary extends Startable {
    private dbReader: DbReader;
    private strategy: StartableLike;
    private context: ContextLike;

    constructor(
        Strategy: StrategyConstructor,
        dbFilePath: string,
    ) {
        super();
        this.dbReader = new DbReader(dbFilePath);
        this.strategy = new Strategy(this.context);
    }

    protected async _start() {

    }

    protected async _stop() {

    }
}
