export * from 'interfaces';
import {
    Side,
    Assets,
} from 'interfaces';

export interface RawTrade {
    price: number;
    quantity: number;
    side: Side;
    time: number;
}

export const enum Open {
    CLOSE = Side.ASK,
    OPEN = Side.BID,
}
export const OPEN = Open.OPEN;
export const CLOSE = Open.CLOSE;

export interface Cost {
    [long: number]: number;
}
