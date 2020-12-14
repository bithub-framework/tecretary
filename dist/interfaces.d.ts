export * from 'interfaces';
import { Side } from 'interfaces';
export interface RawTrade {
    price: number;
    quantity: number;
    side: Side;
    time: number;
}
export declare const enum Open {
    CLOSE = 1,
    OPEN = 0
}
export declare const OPEN: Open;
export declare const CLOSE: Open;
export interface Cost {
    [long: number]: number;
}
