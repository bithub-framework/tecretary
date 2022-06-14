import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
export declare function makeOrderbookCheckPoints<H extends HLike<H>>(orderbooks: Iterable<DatabaseOrderbook<H>>, adminTex: AdminFacade<H>): Iterable<CheckPoint>;
