import {
	DefaultContainer as TexchangeDefaultContainer,
} from 'texchange';
import {
	TYPES as TexchangeDefaultTYPES,
} from 'texchange/build/injection/default/types';
import { Texchange } from 'texchange/build/texchange';
import {
	TYPES as TecretaryTYPES,
	BaseContainer as TecretaryBaseContainer,
} from '../..';
import { Config } from '../../build/config';
import {
	HStatic,
	StrategyLike,
} from 'secretary-like';
import { BigH as H } from 'high-precision';
import { Strategy } from './strategy';
import { adapt } from 'startable-adaptor';



class TecretaryContainer extends TecretaryBaseContainer<H> {
	public [TecretaryTYPES.config] = this.rv<Config>({
		projectName: 'test',
		marketNames: ['binance-perpetual-btcusdt'],
		snapshotPeriod: Number.POSITIVE_INFINITY,
		continue: false,
	});
	public [TecretaryTYPES.texchangeMap] = this.rfs<Map<string, Texchange<H>>>(() => {
		const texchangeContainer = new TexchangeDefaultContainer(
			this[TecretaryTYPES.timeline](),
			this[TecretaryTYPES.hStatic](),
			new H(1000),
			new H(7000),
		);
		return new Map<string, Texchange<H>>([[
			'binance-perpetual-btcusdt',
			texchangeContainer[TexchangeDefaultTYPES.texchange](),
		]]);
	});
	public [TecretaryTYPES.hStatic] = this.rv<HStatic<H>>(H);
	public [TecretaryTYPES.progressFilePath] = this.rv<string>(
		'../progress.db',
	);
	public [TecretaryTYPES.dataFilePath] = this.rv<string>(
		'/media/1tb/tecretary.db',
	);
	public [TecretaryTYPES.startTime] = this.rv<number>(
		1577807996537,
	);
	public [TecretaryTYPES.endTime] = this.rfs<number>(
		() => this[TecretaryTYPES.startTime]() + 1 * 60 * 60 * 1000,
	);
	public [TecretaryTYPES.strategy] = this.rfs<StrategyLike>(
		() => new Strategy(this[TecretaryTYPES.context]()),
	);
}

const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[TecretaryTYPES.tecretary]();

adapt(
	tecretary,
	3000,
	3000,
	3000,
);
