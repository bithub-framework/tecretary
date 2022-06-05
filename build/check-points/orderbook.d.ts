import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
export declare function makeOrderbookCheckPoints<H extends HLike<H>>(orderbooks: Iterable<DatabaseOrderbook<H>>, adminTex: AdminTex<H>): Iterable<CheckPoint>;
