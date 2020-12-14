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

// export const enum Operation {
//     CLOSE = 0,
//     OPEN = 1,
// }
// export const OPEN = Operation.OPEN;
// export const CLOSE = Operation.CLOSE;

export interface Cost {
    [long: number]: number;
}
