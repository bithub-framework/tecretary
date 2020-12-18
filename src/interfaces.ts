export * from 'interfaces';
import {
    Side,
} from 'interfaces';
import { Config as TexchangConfig } from 'texchange';

export interface RawTrade {
    price: number;
    quantity: number;
    side: Side;
    time: number;
}

export interface Config extends TexchangConfig {
    DB_FILE_PATH: string;
}
