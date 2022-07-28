import {
	Texchange,
	DefaultContainer as TexchangeDefaultContainer,
	DEFAULT_TYPES as TEXCHANGE_DEFAULT_TYPES,
} from 'texchange';
import {
	BASE_TYPES as TECRETARY_BASE_TYPES,
	BaseContainer as TecretaryBaseContainer,
	Config,
} from '../..';
import {
	HStatic,
	StrategyStaticLike,
} from 'secretary-like';
import {
	BigH as H,
	BigHFactory as HFactory,
} from 'high-precision';
import { Strategy } from './strategy';
import { adapt } from 'startable-adaptor';



class TecretaryContainer extends TecretaryBaseContainer<H> {
	public [TECRETARY_BASE_TYPES.config] = this.rv<Config>({
		projectName: 'test',
		marketNames: ['binance-perpetual-btcusdt'],
		snapshotPeriod: Number.POSITIVE_INFINITY,
		continue: false,
	});
	public [TECRETARY_BASE_TYPES.texchangeMap] = this.rfs<Map<string, Texchange<H>>>(() => {
		const texchangeContainer = new TexchangeDefaultContainer<H>(
			this[TECRETARY_BASE_TYPES.timeline](),
			this[TECRETARY_BASE_TYPES.hFactory](),
			this[TECRETARY_BASE_TYPES.hStatic](),
			new H(1000),
			new H(7000),
		);
		return new Map<string, Texchange<H>>([[
			'binance-perpetual-btcusdt',
			texchangeContainer[TEXCHANGE_DEFAULT_TYPES.texchange](),
		]]);
	});
	public [TECRETARY_BASE_TYPES.hFactory] = this.rv<HFactory>(new HFactory());
	public [TECRETARY_BASE_TYPES.hStatic] = this.rv<HStatic<H>>(H);
	public [TECRETARY_BASE_TYPES.progressFilePath] = this.rv<string>(
		'../progress.db',
	);
	public [TECRETARY_BASE_TYPES.dataFilePath] = this.rv<string>(
		'/media/1tb/tecretary.db',
	);
	public [TECRETARY_BASE_TYPES.startTime] = this.rv<number>(
		1577807996537,
	);
	public [TECRETARY_BASE_TYPES.endTime] = this.rfs<number>(
		() => this[TECRETARY_BASE_TYPES.startTime]() + 1 * 60 * 60 * 1000,
	);
	public [TECRETARY_BASE_TYPES.Strategy] = this.rv<StrategyStaticLike<H>>(Strategy);
}

const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[TECRETARY_BASE_TYPES.tecretary]();

adapt(
	tecretary,
	3000,
	3000,
	3000,
);
