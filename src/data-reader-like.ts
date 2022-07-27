import {
	HLike,
	MarketSpec,
} from 'secretary-like';
import { StartableLike } from 'startable';
import { DatabaseOrderbook } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseOrderbookId } from 'texchange/build/interfaces/database-orderbook';
import { DatabaseTrade } from 'texchange/build/interfaces/database-trade';
import { DatabaseTradeId } from 'texchange/build/interfaces/database-trade';



export interface DataReaderLike<H extends HLike<H>> extends StartableLike {
	getDatabaseOrderbooksAfterId(
		marketName: string,
		marketSpec: MarketSpec<H>,
		id: DatabaseOrderbookId,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void>;

	getDatabaseOrderbooksAfterTime(
		marketName: string,
		marketSpec: MarketSpec<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void>;

	getDatabaseTradeGroupsAfterId(
		marketName: string,
		marketSpec: MarketSpec<H>,
		id: DatabaseTradeId,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void>;

	getDatabaseTradeGroupsAfterTime(
		marketName: string,
		marketSpec: MarketSpec<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void>;
}
