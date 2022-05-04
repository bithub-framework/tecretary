import { Side } from 'interfaces';

export interface RawBookOrder {
	marketName: string;
	time: number;
	id: number;
	price: string;
	quantity: string;
	side: Side;
}

export interface RawTrade {
	marketName: string;
	price: string;
	quantity: string;
	side: Side;
	time: number;
	id: number;
}
