import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange, DatabaseTradeLike } from 'texchange';
export declare function makeTradeGroupCheckPoints<H extends HLike<H>>(groups: Iterable<DatabaseTradeLike<H>[]>, texchange: Texchange<H>): Iterable<CheckPoint>;
