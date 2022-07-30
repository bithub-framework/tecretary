import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import {
	Texchange,
	DatabaseOrderbookLike,
} from 'texchange';


export function* makeOrderbookCheckPoints<H extends HLike<H>>(
	orderbooks: Iterable<DatabaseOrderbookLike<H>>,
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
