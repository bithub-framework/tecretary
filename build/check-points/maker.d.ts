import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DataReader } from '../data-reader';
export declare class CheckPointsMaker<H extends HLike<H>> {
    private dataReader;
    private adminTexMap;
    constructor(dataReader: DataReader<H>, adminTexMap: Map<string, AdminTex<H, any>>);
    make(): IterableIterator<CheckPoint>;
    makeOrderbookCheckPoints(marketName: string, adminTex: AdminTex<H, any>): Generator<CheckPoint, void, unknown>;
    makeTradeGroupCheckPoints(marketName: string, adminTex: AdminTex<H, any>): Generator<CheckPoint, void, unknown>;
}
