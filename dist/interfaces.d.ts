export * from 'interfaces';
import { Side } from 'interfaces';
export interface RawTrade {
    price: number;
    quantity: number;
    side: Side;
    time: number;
}
