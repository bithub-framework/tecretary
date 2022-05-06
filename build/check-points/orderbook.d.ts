import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
export declare function checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(orderbooks: IterableIterator<DatabaseOrderbook<H>>, adminTex: AdminTex<H, unknown>): Generator<CheckPoint, void>;
