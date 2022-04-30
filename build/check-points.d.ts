import { HLike } from 'interfaces';
import { CheckPoint } from './time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
export declare function checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(orderbooks: IterableIterator<DatabaseOrderbook<H>>, adminTex: AdminTex<H>): Generator<CheckPoint, void>;
export declare function checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(groups: IterableIterator<DatabaseTrade<H>[]>, adminTex: AdminTex<H>): Generator<CheckPoint, void>;
