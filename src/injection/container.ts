import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { NodeTimeEngine } from 'node-time-engine';
import { HLike, StrategyLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context/context';
import { Texchange } from 'texchange/build/texchange/texchange';
import { Tecretary } from '../tecretary';



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
