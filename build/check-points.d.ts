import { HLike } from 'interfaces';
import { CheckPoint } from './time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/use-cases.d/update-orderbook';
import { DatabaseTrade } from 'texchange/build/use-cases.d/update-trades';
export declare function checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(orderbooks: IterableIterator<DatabaseOrderbook<H>>, adminTex: AdminTex<H>): Generator<CheckPoint, void>;
export declare function checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(groups: IterableIterator<DatabaseTrade<H>[]>, adminTex: AdminTex<H>): Generator<CheckPoint, void>;
