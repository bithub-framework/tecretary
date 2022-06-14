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

	public abstract [TYPES.Config]: () => Config;

	public [TYPES.ProgressReader] = this.rcs<ProgressReader>(ProgressReader);

	public [TYPES.Timeline] = this.rfs<Timeline>(() => {
		const progressReader = this[TYPES.ProgressReader]();
		return new Timeline(
			progressReader.getTime(),
			new NodeTimeEngine(),
		);
	});

	public [TYPES.TimelineLike] = () => this[TYPES.Timeline]();

	public abstract [TYPES.TexchangeMap]: () => Map<string, Texchange<H>>;

	public [TYPES.Context] = this.rcs<Context<H>>(Context);

	public abstract [TYPES.StrategyLike]: () => StrategyLike;

	public [TYPES.Tecretary] = this.rcs<Tecretary<H>>(Tecretary);
}
