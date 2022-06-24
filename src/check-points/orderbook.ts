import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { Texchange } from 'texchange/build/texchange';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';


export function* makeOrderbookCheckPoints<H extends HLike<H>>(
	orderbooks: Iterable<DatabaseOrderbook<H>>,
	texchange: Texchange<H>,
): Iterable<CheckPoint> {
	const facade = texchange.getAdminFacade();
	for (const orderbook of orderbooks) {
		yield {
			cb: () => {
				facade.updateOrderbook(orderbook);
			},
			time: orderbook.time,
		}
	}
}
