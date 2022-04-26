export interface RawOrderbook {
	marketName: string;
	asks: string;
	bids: string;
	time: number;
}

export namespace RawOrderbook {
	export type Asks = [string, string][];
	export type Bids = [string, string][];
}

export interface RawTrade {
	marketName: string;
	price: string;
	quantity: string;
	side: string;
	time: number;
	id: string;
}
