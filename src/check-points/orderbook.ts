import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';


export function* checkPointsFromDatabaseOrderbooks<H extends HLike<H>>(
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