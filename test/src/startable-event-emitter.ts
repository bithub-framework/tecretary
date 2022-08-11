import { createStartable, ReadyState } from 'startable';
import { EventEmitter } from 'events';
import assert = require('assert');


export class StartableEventEmitter extends EventEmitter {
	public $s = createStartable(
		this.rawStart.bind(this),
		this.rawStop.bind(this),
	);
	private async rawStart() { }
	private async rawStop(err?: Error) {
		assert(err);
		this.emit('error', err);
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
