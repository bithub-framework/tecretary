import {
	createStartable,
	ReadyState,
	DaemonLike,
} from 'startable';
import { EventEmitter } from 'events';
import assert = require('assert');


export class StartableEventEmitter extends EventEmitter implements DaemonLike {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	protected async rawStart() { }
	protected async rawStop() {
		this.emit('error', new Stopping);
	}

	public constructor() {
		super();
		this.on('error', () => { });
	}

	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		return super.on(event, <any>listener);
	}

	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		return super.once(event, <any>listener);
	}

	public emit(event: string | symbol, ...args: any[]): boolean {
		assert(this.$s.getReadyState() === ReadyState.STARTED);
		return super.emit(event, ...args);
	}
}

export class Stopping extends Error { }
