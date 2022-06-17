import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange } from 'texchange/build/texchange/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
export declare function makeOrderbookCheckPoints<H extends HLike<H>>(orderbooks: Iterable<DatabaseOrderbook<H>>, texchange: Texchange<H>): Iterable<CheckPoint>;
