import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
export declare function makeTradeGroupCheckPoints<H extends HLike<H>>(groups: Iterable<DatabaseTrade<H>[]>, adminTex: AdminFacade<H>): Iterable<CheckPoint>;
