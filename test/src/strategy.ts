import {
	StrategyLike,
	ContextLike,
	HLike,
	Trade,
	Orderbook,
} from 'secretary-like';
import { Startable } from 'startable';


export class Strategy<H extends HLike<H>> implements StrategyLike {
	private startable = Startable.create(
		() => this.rawStart(),
		() => this.rawStop(),
	);
	public start = this.startable.start;
	public stop = this.startable.stop;
	public assart = this.startable.assart;
	public starp = this.startable.starp;
	public getReadyState = this.startable.getReadyState;
	public skipStart = this.startable.skipStart;

	private latestPrice: H | null = null;

	public constructor(
		private ctx: ContextLike<H>,
	) { }

	private onTrades = (trades: Trade<H>[]) => {
		this.latestPrice = trades[trades.length - 1].price;
		console.log(`trades    - ${trades[0].time}`);
	}

	private onOrderbook = (orderbook: Orderbook<H>) => {
		console.log(`orderbook - ${orderbook.time}`);
	}

	private async rawStart(): Promise<void> {
		this.ctx[0].on('trades', this.onTrades);
		this.ctx[0].on('orderbook', this.onOrderbook);
	}

	private async rawStop(): Promise<void> {
		this.ctx[0].off('trades', this.onTrades);
		this.ctx[0].off('orderbook', this.onOrderbook);
	}
}
