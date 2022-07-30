import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange, DatabaseOrderbookLike } from 'texchange';
export declare function makeOrderbookCheckPoints<H extends HLike<H>>(orderbooks: Iterable<DatabaseOrderbookLike<H>>, texchange: Texchange<H>): Iterable<CheckPoint>;
