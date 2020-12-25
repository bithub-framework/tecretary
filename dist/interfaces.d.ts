export * from 'interfaces';
export { RawTrade } from 'texchange';
import { Config as TexchangeConfig } from 'texchange';
import { StartableLike } from 'startable';
import { ContextLike } from 'interfaces';
export interface Config extends TexchangeConfig {
    DB_FILE_PATH: string;
}
export interface StrategyConstructor {
    new (ctx: ContextLike): StartableLike;
}
