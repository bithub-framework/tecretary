import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DataReader } from '../data-reader';
import { checkPointsFromDatabaseOrderbooks } from './orderbook';
import { checkPointsFromDatabaseTradeGroups } from './trade-group';
import { sortMerge } from '../merge';



export function makeCheckPoints<H extends HLike<H>>(
	dataReader: DataReader<H>,
	adminTexMap: Map<string, AdminTex<H>>,
): IterableIterator<CheckPoint> {
	const sortMergeCheckPoints = sortMerge<CheckPoint>((a, b) => a.time - b.time);

	function makeOrderbookCheckPoints(
		marketName: string,
		adminTex: AdminTex<H>,
	) {
		return checkPointsFromDatabaseOrderbooks(
			dataReader.getDatabaseOrderbooks(
				marketName,
				adminTex,
			),
			adminTex,
		);
	}

	function makeTradeGroupCheckPoints(
		marketName: string,
		adminTex: AdminTex<H>,
	) {
		return checkPointsFromDatabaseTradeGroups(
			dataReader.getDatabaseTradeGroups(
				marketName,
				adminTex,
			),
			adminTex,
		);
	}

	return sortMergeCheckPoints(...
		(<IterableIterator<CheckPoint>[]>[]).concat(...
			[...adminTexMap].map(([marketName, adminTex]) => [
				makeOrderbookCheckPoints(marketName, adminTex),
				makeTradeGroupCheckPoints(marketName, adminTex)
			]),
		));
}
