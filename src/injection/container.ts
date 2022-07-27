import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { NodeTimeEngine } from 'node-time-engine';
import {
	HLike, HFactory,
	StrategyLike, StrategyStaticLike,
} from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { DataReader } from '../data-reader';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import { Texchange } from 'texchange';
import { Tecretary } from '../tecretary';



export abstract class Container<H extends HLike<H>> extends BaseContainer {
	public abstract [TYPES.config]: () => Config;
	public [TYPES.progressReader] = this.rcs<ProgressReader<H>>(ProgressReader);
	public abstract [TYPES.startTime]: () => number;
	public abstract [TYPES.progressFilePath]: () => string;
	public [TYPES.dataReader] = this.rcs<DataReader<H>>(DataReader);
	public abstract [TYPES.dataFilePath]: () => string;

	public abstract [TYPES.texchangeMap]: () => Map<string, Texchange<H>>;
	public [TYPES.timeline] = this.rfs<Timeline>(() => {
		const progressReader = this[TYPES.progressReader]();
		return new Timeline(
			progressReader.getTime(),
			new NodeTimeEngine(),
		);
	});
	public abstract [TYPES.endTime]: () => number;
	public [TYPES.context] = this.rcs<Context<H>>(Context);

	public abstract [TYPES.Strategy]: () => StrategyStaticLike<H>;
	public [TYPES.strategy] = this.rfs<StrategyLike>(() => {
		const Strategy = this[TYPES.Strategy]();
		const ctx = this[TYPES.context]();
		return new Strategy(ctx);
	});

	public abstract [TYPES.hFactory]: () => HFactory<H>;
	public [TYPES.tecretary] = this.rcs<Tecretary<H>>(Tecretary);
}
