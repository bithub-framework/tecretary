import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange } from 'texchange/build/texchange/texchange';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';



export function* makeTradeGroupCheckPoints<H extends HLike<H>>(
	groups: Iterable<DatabaseTrade<H>[]>,
	texchange: Texchange<H>,
): Iterable<CheckPoint> {
	const facade = texchange.getAdminFacade();
	for (const group of groups) {
		yield {
			cb: () => {
				facade.updateTrades(group);
			},
			time: group[0].time,
		};
	}
}
