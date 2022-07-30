import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import {
	Texchange,
	DatabaseTradeLike,
} from 'texchange';



export function* makeTradeGroupCheckPoints<H extends HLike<H>>(
	groups: Iterable<DatabaseTradeLike<H>[]>,
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
