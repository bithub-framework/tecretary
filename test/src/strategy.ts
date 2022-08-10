import {
	StrategyLike,
	ContextLike,
	HLike,
	Trade,
	Orderbook,
	Side, Length, Action,
} from 'secretary-like';
import { createStartable } from 'startable';
import { Pollerloop, Loop, LoopStopped } from 'pollerloop';
import assert = require('assert');
import { PositionController } from './position-controller';
import { Throttle } from './throttle';


export class Strategy<H extends HLike<H>> implements StrategyLike {
	public $s = createStartable(
		() => this.rawStart(),
		() => this.rawStop(),
	);

	private latestPrice: H | null = null;

	private poller: Pollerloop;
	private pc = new PositionController<H>(
		this.ctx,
	);

	public constructor(
		private ctx: ContextLike<H>,
	) {
		this.poller = new Pollerloop(this.loop, ctx.timeline);
	}

	private loop: Loop = async sleep => {
		for (let goal = '.01'; ;) {
			this.pc.setGoal(goal);

			await sleep(60 * 1000);
			if (goal === '.01') goal = '-0.01'; else goal = '.01';
		}
	}

	private onTrades = async (trades: Trade<H>[]): Promise<void> => {
		this.latestPrice = trades[trades.length - 1].price;
		// console.log(`trades    - ${trades[0].time}`);
	}

	private onOrderbook = async (orderbook: Orderbook<H>): Promise<void> => {
		// console.log(`orderbook - ${orderbook.time}`);
	}

	private onceOrderbook = async (orderbook: Orderbook<H>): Promise<void> => {
		// console.log(`orderbook - ${orderbook.time}`);
		// const results = await this.ctx[0][0].makeOrders([{
		// 	price: orderbook[Side.ASK][0].price.minus(1),
		// 	quantity: orderbook[Side.ASK][0].quantity,
		// 	length: Length.LONG,
		// 	action: Action.OPEN,
		// 	side: Side.BID,
		// }]);
		// if (results[0] instanceof Error)
		// 	console.log(results[0]);
		// else
		// 	console.log(results[0].toJSON());
	}

	private onError = (err: Error) => {
		// console.error(err);
		this.$s.starp();
	}

	private async rawStart(): Promise<void> {
		this.ctx[0].on('trades', this.onTrades);
		this.ctx[0].on('orderbook', this.onOrderbook);
		this.ctx[0].once('orderbook', this.onceOrderbook);
		this.ctx[0].on('error', this.onError);
		await this.poller.$s.start(this.$s.starp);
	}

	private async rawStop(): Promise<void> {
		await this.poller.$s.stop();
		this.ctx[0].off('trades', this.onTrades);
		this.ctx[0].off('orderbook', this.onOrderbook);
		this.ctx[0].off('orderbook', this.onceOrderbook);
		this.ctx[0].off('error', this.onError);
	}
}
