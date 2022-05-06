import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
export declare function checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(groups: IterableIterator<DatabaseTrade<H>[]>, adminTex: AdminTex<H, unknown>): Generator<CheckPoint, void>;
