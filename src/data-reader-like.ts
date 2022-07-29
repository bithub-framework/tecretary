import {
	HLike,
	MarketSpecLike,
} from 'secretary-like';
import { StartableLike } from 'startable';
import {
	DatabaseOrderbook,
	DatabaseOrderbookId,
	DatabaseTrade,
	DatabaseTradeId,
} from 'texchange';



export interface DataReaderLike<H extends HLike<H>> extends StartableLike {
	getDatabaseOrderbooksAfterId(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
		id: DatabaseOrderbookId,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void>;

	getDatabaseOrderbooksAfterTime(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseOrderbook<H>, void>;

	getDatabaseTradeGroupsAfterId(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
		id: DatabaseTradeId,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void>;

	getDatabaseTradeGroupsAfterTime(
		marketName: string,
		marketSpec: MarketSpecLike<H>,
		afterTime: number,
		endTime: number,
	): Generator<DatabaseTrade<H>[], void>;
}
