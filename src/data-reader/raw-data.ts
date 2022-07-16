import { Side } from 'secretary-like';

export interface RawBookOrder {
	time: number;
	id: number;
	price: string;
	quantity: string;
	side: Side;
}

export interface RawTrade {
	price: string;
	quantity: string;
	side: Side;
	time: number;
	id: number;
}
