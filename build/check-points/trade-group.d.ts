import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange } from 'texchange/build/texchange';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
export declare function makeTradeGroupCheckPoints<H extends HLike<H>>(groups: Iterable<DatabaseTrade<H>[]>, texchange: Texchange<H>): Iterable<CheckPoint>;
