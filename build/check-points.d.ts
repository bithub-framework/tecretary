import { HLike } from 'interfaces';
import { CheckPoint } from 'timeline';
import { AdminTex } from 'texchange/build/texchange';
import { DataReader } from './data-reader';
export declare class CheckPointsMaker<H extends HLike<H>> {
    private dataReader;
    constructor(dataReader: DataReader<H>);
    makeOrderbookCheckPoints(marketName: string, adminTex: AdminTex<H, any>): Generator<CheckPoint, void, unknown>;
    makeTradeGroupCheckPoints(marketName: string, adminTex: AdminTex<H, any>): Generator<CheckPoint, void, unknown>;
}
