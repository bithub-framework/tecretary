import {
	StrategyLike,
	ContextLike,
	HLike,
	Trade,
	Orderbook,
	Side, Length, Action,
} from 'secretary-like';
import { Startable } from 'startable';
import { Pollerloop, Loop } from 'pollerloop';


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

	private bought = false;

	private poller: Pollerloop;

	public constructor(
		private ctx: ContextLike<H>,
	) {
		this.poller = new Pollerloop(this.loop, ctx.timeline);
	}

	private loop: Loop = async sleep => {
		for (const startTime = this.ctx.timeline.now();
			this.ctx.timeline.now() < startTime + 60 * 60 * 1000;
			await sleep(60 * 1000)
		) {
			const balances = await this.ctx[0][0].getBalances();
			console.log(JSON.stringify(balances));
		}
	}

	private onTrades = async (trades: Trade<H>[]): Promise<void> => {
		this.latestPrice = trades[trades.length - 1].price;
		// console.log(`trades    - ${trades[0].time}`);
	}

	private onOrderbook = async (orderbook: Orderbook<H>): Promise<void> => {
		// console.log(`orderbook - ${orderbook.time}`);
		if (this.bought) return;
		this.bought = true;
		const results = await this.ctx[0][0].makeOrders([{
			price: orderbook.get(Side.ASK)[0].price,
			quantity: orderbook.get(Side.ASK)[0].quantity,
			length: Length.LONG,
			action: Action.OPEN,
			side: Side.BID,
		}]);
		console.log(JSON.stringify(results[0]));
	}

	private async rawStart(): Promise<void> {
		this.ctx[0].on('trades', this.onTrades);
		this.ctx[0].on('orderbook', this.onOrderbook);
		await this.poller.start(this.starp);
	}

	private async rawStop(): Promise<void> {
		this.ctx[0].off('trades', this.onTrades);
		this.ctx[0].off('orderbook', this.onOrderbook);
		await this.poller.stop();
	}
}
