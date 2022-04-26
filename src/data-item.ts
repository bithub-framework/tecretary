import { DatabaseTrades } from 'texchange/build/use-cases.d/update-trades';
import { AdminTex } from 'texchange/build/texchange';
import {
	HLike,
	Orderbook,
} from 'interfaces';



export abstract class DataItem<H extends HLike<H>> {
	public constructor(
		protected tex: AdminTex<H>,
		public time: number,
	) { }

	public abstract apply(): void;
}

export class OrderbookDataItem<H extends HLike<H>> extends DataItem<H> {
	public constructor(
		private orderbook: Orderbook<H>,
		tex: AdminTex<H>,
	) {
		super(tex, orderbook.time);
	}

	public apply(): void {
		this.tex.updateOrderbook(this.orderbook);
	}
}

export class TradesDataItem<H extends HLike<H>> extends DataItem<H> {
	public constructor(
		private trades: DatabaseTrades<H>,
		tex: AdminTex<H>,
	) {
		super(tex, trades[0].time);
	}

	public apply(): void {
		this.tex.updateTrades(this.trades);
	}
}
