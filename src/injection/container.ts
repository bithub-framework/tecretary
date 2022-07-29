import { BaseContainer } from '@zimtsui/injektor';
import { TYPES } from './types';
import { NodeTimeEngine } from 'node-time-engine';
import {
	HLike, HFactory, HStatic,
	StrategyLike, StrategyStaticLike,
} from 'secretary-like';
import { Config } from '../config';
import { ProgressReader } from '../progress-reader';
import { ProgressReaderLike } from '../progress-reader-like';
import { DataReader } from '../data-reader';
import { DataReaderLike } from '../data-reader-like';
import { Timeline } from '../timeline/timeline';
import { Context } from '../context';
import {
	Texchange,
	DataTypesNamespace as TexchangeDataTypesNamespace,
} from 'texchange';
import { Tecretary } from '../tecretary';



export abstract class Container<H extends HLike<H>> extends BaseContainer {
	public abstract [TYPES.config]: () => Config;
	public [TYPES.TexchangeDataTypes] = this.rfs<TexchangeDataTypesNamespace<H>>(() => {
		return new TexchangeDataTypesNamespace(
			this[TYPES.hFactory](),
			this[TYPES.hStatic](),
		);
	});
	public [TYPES.progressReader] = this.rcs<ProgressReaderLike<H>>(ProgressReader);
	public abstract [TYPES.startTime]: () => number;
	public abstract [TYPES.progressFilePath]: () => string;
	public [TYPES.dataReader] = this.rcs<DataReaderLike<H>>(DataReader);
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
	public abstract [TYPES.hStatic]: () => HStatic<H>;

	public [TYPES.tecretary] = this.rcs<Tecretary<H>>(Tecretary);
}
