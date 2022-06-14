import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminFacade } from 'texchange/build/facades.d/admin';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';



export function* makeTradeGroupCheckPoints<H extends HLike<H>>(
	groups: Iterable<DatabaseTrade<H>[]>,
	adminTex: AdminFacade<H>,
): Iterable<CheckPoint> {
	for (const group of groups) {
		yield {
			cb: () => {
				adminTex.updateTrades(group);
			},
			time: group[0].time,
		};
	}
}
