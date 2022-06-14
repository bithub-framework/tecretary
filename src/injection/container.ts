import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { NodeTimeEngine } from 'node-time-engine';
import { HLike, StrategyLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { Texchange } from 'texchange/build/texchange/texchange';
import { UserMarketFacade } from 'texchange/build/facades.d/user-market';
import { UserAccountFacade } from 'texchange/build/facades.d/user-account';
import { Tecretary } from '../tecretary';
import assert = require('assert');



export abstract class Container<H extends HLike<H>> extends BaseContainer {

	public abstract [TYPES.config]: () => Config;

	public [TYPES.progressReader] = this.rcs<ProgressReader>(ProgressReader);

	public [TYPES.timeline] = this.rfs<Timeline>(() => {
		const progressReader = this[TYPES.progressReader]();
		return new Timeline(
			progressReader.getTime(),
			new NodeTimeEngine(),
		);
	});

	public abstract [TYPES.texchangeMap]: () => Map<string, Texchange<H>>;

	public [TYPES.context] = this.rcs<Context<H>>(Context);

	public abstract [TYPES.strategy]: () => StrategyLike;

	public [TYPES.tecretary] = this.rcs<Tecretary<H>>(Tecretary);
}
