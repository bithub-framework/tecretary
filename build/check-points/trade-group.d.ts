import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange, DatabaseTrade } from 'texchange';
export declare function makeTradeGroupCheckPoints<H extends HLike<H>>(groups: Iterable<DatabaseTrade<H>[]>, texchange: Texchange<H>): Iterable<CheckPoint>;
