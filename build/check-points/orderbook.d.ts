import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
export declare function checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(orderbooks: IterableIterator<DatabaseOrderbook<H>>, adminTex: AdminTex<H, unknown>): Generator<CheckPoint, void>;
