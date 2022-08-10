import {
	createStartable,
	ReadyState,
} from 'startable';
import {
	OpenOrder,
	HLike,
	Length, Side, Action,
	ContextLike,
	Positions,
	LimitOrder,
	Orderbook,
	MarketEvents,
	AccountEvents,
} from 'secretary-like';
import assert = require('assert');
import { Pollerloop, Loop } from 'pollerloop';
import { EventEmitter, once } from 'events';
import { nodeTimeEngine } from 'node-time-engine';


export class AutoOrder<H extends HLike<H>> {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);

	private poller: Pollerloop;
	private broadcast: BroadcastLike<H>;

	public constructor(
		private latest: H,
		private goal: H,
		private ctx: ContextLike<H>,
	) {
		assert(latest.neq(goal), new LatestSameAsGoal());
		this.broadcast = <BroadcastLike<H>>new EventEmitter();
		this.broadcast.on('error', () => { });
		this.poller = new Pollerloop(this.loop, nodeTimeEngine);
	}

	private makeLimitOrder(orderbook: Orderbook<H>): LimitOrder<H> {
		const price = this.latest.lt(this.goal)
			? orderbook[Side.ASK][0].price.minus(this.ctx[0].TICK_SIZE)
			: orderbook[Side.BID][0].price.plus(this.ctx[0].TICK_SIZE);
		const quantity = this.goal.minus(this.latest).abs();
		const side = this.latest.lt(this.goal) ? Side.BID : Side.ASK;
		const action = Action.CLOSE;
		const length = Length.from(side, action);
		return this.ctx.DataTypes.limitOrderFactory.create({
			price, quantity, side, action, length,
		});
	}

	private loop: Loop = async sleep => {
		const [orderbook] = <[Orderbook<H>]>await once(this.broadcast, 'orderbook');
		const limitOrder = this.makeLimitOrder(orderbook);
		let [openOrder] = await this.ctx[0][0].makeOrders([limitOrder]);
		assert(!(openOrder instanceof Error), <Error>openOrder);
		try {
			const positions = await new Promise<Positions<H>>((resolve, reject) => {
				this.broadcast.on('error', reject);
				this.broadcast.on('positions', resolve);
				this.broadcast.on('orderbook', orderbook => {
					if (
						limitOrder.side === Side.BID &&
						orderbook[Side.BID][0].price.gt(limitOrder.price)
						||
						limitOrder.side === Side.ASK &&
						orderbook[Side.ASK][0].price.lt(limitOrder.price)
					) reject(new OrderbookMoving());
				});
			});
			this.latest = positions.position[Length.LONG]
				.minus(positions.position[Length.SHORT]);
		} catch (err) {
			assert(
				err instanceof OrderbookMoving ||
				err instanceof Stopping,
				<Error>err,
			);
			[openOrder] = await this.ctx[0][0].cancelOrders([openOrder]);
			this.latest = openOrder.side === Side.BID
				? this.goal.minus(openOrder.unfilled)
				: this.goal.plus(openOrder.unfilled);
			throw err;
		} finally {
			this.broadcast.removeAllListeners('positions');
			this.broadcast.removeAllListeners('orderbook');
		}
	}

	private async rawStart() {
		this.ctx[0].on('orderbook', this.onCtxOrderbook);
		this.ctx[0][0].on('positions', this.onCtxPositions);
		this.ctx[0].on('error', this.onCtxError);
		this.ctx[0][0].on('error', this.onCtxError);
		await this.poller.$s.start(err => {
			if (err instanceof Stopping) this.$s.starp();
			else this.$s.starp(err);
		});
	}

	private async rawStop() {
		this.ctx[0].off('orderbook', this.onCtxOrderbook);
		this.ctx[0][0].off('positions', this.onCtxPositions);
		this.ctx[0].off('error', this.onCtxError);
		this.ctx[0][0].off('error', this.onCtxError);
		this.broadcast.emit('error', new Stopping());
		await this.poller.$s.starp();
	}

	public getLatest(): H {
		return this.latest;
	}

	private onCtxOrderbook = (orderbook: Orderbook<H>) => {
		this.broadcast.emit('orderbook', orderbook);
	}

	private onCtxPositions = (positions: Positions<H>) => {
		this.broadcast.emit('positions', positions);
	}

	private onCtxError = (err: Error) => {
		this.broadcast.emit('error', err);
	}
}

export class LatestSameAsGoal extends Error { }
class OrderbookMoving extends Error { }
class Stopping extends Error { }

interface Events<H extends HLike<H>>
	extends MarketEvents<H>, AccountEvents<H> { }

interface BroadcastLike<H extends HLike<H>> extends EventEmitter {
	on<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	once<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	off<Event extends keyof Events<H>>(event: Event, listener: (...args: Events<H>[Event]) => void): this;
	emit<Event extends keyof Events<H>>(event: Event, ...args: Events<H>[Event]): boolean;
	removeAllListeners<Event extends keyof Events<H>>(event?: Event): this;
}
