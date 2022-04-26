import { Orderbook } from 'interfaces';
import { OrderbookDataItem } from './data-item';
import {
	HLike,
	Side,
	HStatic,
} from 'interfaces';
import { RawOrderbook } from './raw-data';
import { AdminTex } from 'texchange/build/texchange';
import assert = require('assert');


export async function* orderbookFromRawOrderbooks<H extends HLike<H>>(
	rawOrderbooks: AsyncIterableIterator<RawOrderbook>,
	H: HStatic<H>,
	adminTexMap: Map<string, AdminTex<H>>,
): AsyncGenerator<OrderbookDataItem<H>, void> {
	try {
		for await (const rawOrderbook of rawOrderbooks) {
			const adminTex = adminTexMap.get(rawOrderbook.marketName);
			assert(adminTex);

			const rawAsks = <RawOrderbook.Asks>JSON.parse(rawOrderbook.asks);
			const rawBids = <RawOrderbook.Bids>JSON.parse(rawOrderbook.bids);
			const orderbook: Orderbook<H> = {
				[Side.ASK]: rawAsks.map(([price, quantity]) => ({
					price: new H(price).round(adminTex.config.market.PRICE_DP),
					quantity: new H(quantity).round(adminTex.config.market.QUANTITY_DP),
					side: Side.ASK,
				})),
				[Side.BID]: rawBids.map(([price, quantity]) => ({
					price: new H(price).round(adminTex.config.market.PRICE_DP),
					quantity: new H(quantity).round(adminTex.config.market.QUANTITY_DP),
					side: Side.BID,
				})),
				time: rawOrderbook.time,
			};
			yield new OrderbookDataItem(
				orderbook,
				adminTex,
			);
		}
	} finally {
		if (rawOrderbooks.return) rawOrderbooks.return();
	}
}
