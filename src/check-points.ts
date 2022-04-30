import { HLike } from 'interfaces';
import { CheckPoint } from './time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';


export function* checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(
	orderbooks: IterableIterator<DatabaseOrderbook<H>>,
	adminTex: AdminTex<H>,
): Generator<CheckPoint, void> {
	for (const orderbook of orderbooks) {
		yield {
			cb: () => {
				adminTex.updateOrderbook(orderbook);
			},
			time: orderbook.time,
		}
	}
}


export function* checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(
	groups: IterableIterator<DatabaseTrade<H>[]>,
	adminTex: AdminTex<H>,
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
