import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { DataReader } from './data-reader';



export class CheckPointsMaker<H extends HLike<H>> {
	public constructor(
		private dataReader: DataReader<H>,
	) { }

	public makeOrderbookCheckPoints(
		marketName: string,
		adminTex: AdminTex<H, any>,
	) {
		return checkPointsFromDatabaseOrderbooks(
			this.dataReader.getDatabaseOrderbooks(
				marketName,
				adminTex,
			),
			adminTex,
		);
	}

	public makeTradeGroupCheckPoints(
		marketName: string,
		adminTex: AdminTex<H, any>,
	) {
		return checkPointsFromDatabaseTradeGroups(
			this.dataReader.getDatabaseTradeGroups(
				marketName,
				adminTex,
			),
			adminTex,
		);
	}
}

function* checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(
	orderbooks: IterableIterator<DatabaseOrderbook<H>>,
	adminTex: AdminTex<H, unknown>,
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


function* checkPointsFromDatabaseTradeGroups<H extends HLike<H>>(
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
