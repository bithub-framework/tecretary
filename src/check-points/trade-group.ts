import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';



export function* checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(
	groups: IterableIterator<DatabaseTrade<H>[]>,
	adminTex: AdminTex<H, unknown>,
): Generator<CheckPoint, void> {
	for (const group of groups) {
		yield {
			cb: () => {
				adminTex.updateTrades(group);
			},
			time: group[0].time,
		}
	}
}
