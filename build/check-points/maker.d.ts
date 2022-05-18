import { HLike } from 'secretary-like';
import { CheckPoint } from '../timeline/time-engine';
import { AdminTex } from 'texchange/build/texchange';
import { DataReader } from '../data-reader';
export declare function makeCheckPoints<H extends HLike<H>>(dataReader: DataReader<H>, adminTexMap: Map<string, AdminTex<H>>): IterableIterator<CheckPoint>;
