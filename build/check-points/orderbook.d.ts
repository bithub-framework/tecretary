import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange, DatabaseOrderbook } from 'texchange';
export declare function makeOrderbookCheckPoints<H extends HLike<H>>(orderbooks: Iterable<DatabaseOrderbook<H>>, texchange: Texchange<H>): Iterable<CheckPoint>;
