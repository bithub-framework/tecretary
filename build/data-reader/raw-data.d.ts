export interface RawBookOrder {
    time: number;
    id: number;
    price: string;
    quantity: string;
    side: RawSide;
}
export interface RawTrade {
    price: string;
    quantity: string;
    side: RawSide;
    time: number;
    id: number;
}
export declare enum RawSide {
    BID = 1,
    ASK = -1
}
