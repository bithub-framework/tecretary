import { HLike } from 'interfaces';
import {
    MarketConfig,
    AccountConfig,
    Config as TexchangeConfig,
} from 'texchange/build/context.d/config';


export interface Config<H extends HLike<H>> {
    DB_FILE_PATH: string;
    projectId: string;
    startTime: number;
    markets: string[];
}
