import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DataReader } from '../data-reader';
import { checkPointsFromDatabaseOrderbooks } from './orderbook';
import { checkPointsFromDatabaseTradeGroups } from './trade-group';
import { sortMerge } from '../merge';


const sortMergeCheckPoints = sortMerge<CheckPoint>((a, b) => a.time - b.time);

export class CheckPointsMaker<H extends HLike<H>> {
	public constructor(
		private dataReader: DataReader<H>,
		private adminTexMap: Map<string, AdminTex<H, any>>,
	) { }

	public make(): IterableIterator<CheckPoint> {
		return sortMergeCheckPoints(...
			(<IterableIterator<CheckPoint>[]>[]).concat(...
				[...this.adminTexMap].map(([marketName, adminTex]) => [
					this.makeOrderbookCheckPoints(marketName, adminTex),
					this.makeTradeGroupCheckPoints(marketName, adminTex)
				]),
			));
	}

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
