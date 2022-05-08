import { BaseContainer } from 'injektor';
import { TYPES } from './types';
import { NodeTimeEngine } from 'node-time-engine';
import { HLike, StrategyLike } from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { UserTex, Texchange } from 'texchange/build/texchange';
import { Tecretary } from '../tecretary';
import assert = require('assert');



export abstract class Container<H extends HLike<H>> extends BaseContainer {
	public constructor(
		private config: Config,
	) { super(); }

	public [TYPES.Config] = this.rv<Config>(this.config);

	public [TYPES.ProgressReader] = this.rcs<ProgressReader>(ProgressReader);

	public [TYPES.Timeline] = this.rfs<Timeline>(() => {
		const progressReader = this[TYPES.ProgressReader]();
		return new Timeline(
			progressReader.getTime(),
			new NodeTimeEngine(),
		);
	});

	public [TYPES.TimelineLike] = () => this[TYPES.Timeline]();

	public abstract [TYPES.TexMap]: () => Map<string, Texchange<H>>;

	public [TYPES.UserTexes] = this.rfs<UserTex<H>[]>(() => {
		const texMap = this[TYPES.TexMap]();
		const config = this[TYPES.Config]();
		const userTexes: UserTex<H>[] = config.markets.map(name => {
			const tex = texMap.get(name);
			assert(typeof tex !== 'undefined');
			return tex.user;
		});
		return userTexes;
	});

	public [TYPES.Context] = this.rcs<Context<H>>(Context);

	public abstract [TYPES.StrategyLike]: () => StrategyLike;

	public [TYPES.Tecretary] = this.rcs<Tecretary<H>>(Tecretary);
}
