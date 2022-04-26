import { TradesDataItem } from './data-item';
import {
	HLike,
	Side,
	HStatic,
} from 'interfaces';
import { RawTrade } from './raw-data';
import { AdminTex } from 'texchange/build/texchange';
import { DatabaseTrades } from 'texchange/build/use-cases.d/update-trades';
import assert = require('assert');


async function* groupRawTradeByMarket(
	rawTrades: AsyncIterableIterator<RawTrade>,
): AsyncGenerator<RawTrade[], void> {
	try {
		let $group: RawTrade[] = [];
		for await (const rawTrade of rawTrades) {
			if (
				$group.length > 0 &&
				$group[0].marketName !== rawTrade.marketName
			) {
				yield $group;
				$group = [];
			}
			$group.push(rawTrade);
		}
		yield $group;
	} finally {
		if (rawTrades.return) rawTrades.return();
	}
}


export async function* tradesfromRawTrade<H extends HLike<H>>(
	rawTrade: AsyncIterableIterator<RawTrade>,
	H: HStatic<H>,
	adminTexMap: Map<string, AdminTex<H>>,
): AsyncGenerator<TradesDataItem<H>, void> {
	const groups = groupRawTradeByMarket(rawTrade);
	try {
		for await (const group of groups) {
			const adminTex = adminTexMap.get(group[0].marketName);
			assert(adminTex);

			const trades: DatabaseTrades<H> = group.map(rawTrade => ({
				price: new H(rawTrade.price).round(adminTex.config.market.PRICE_DP),
				quantity: new H(rawTrade.quantity).round(adminTex.config.market.QUANTITY_DP),
				side: rawTrade.side === 'ASK' ? Side.ASK : Side.BID,
				id: rawTrade.id,
				time: rawTrade.time,
			}));

			yield new TradesDataItem(
				trades,
				adminTex,
			);
		}
	} finally {
		groups.return();
	}
}
