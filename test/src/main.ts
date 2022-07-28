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
	HStatic, HFactory,
	StrategyStaticLike,
} from 'secretary-like';
import {
	BigH,
	bigHFactory,
} from 'high-precision';
import { Strategy } from './strategy';
import { adapt } from 'startable-adaptor';


class TecretaryContainer extends TecretaryBaseContainer<BigH> {
	public [TECRETARY_BASE_TYPES.config] = this.rv<Config>({
		projectName: 'test',
		marketNames: ['binance-perpetual-btcusdt'],
		snapshotPeriod: Number.POSITIVE_INFINITY,
		continue: false,
	});
	public [TECRETARY_BASE_TYPES.texchangeMap] = this.rfs<Map<string, Texchange<BigH>>>(() => {
		const texchangeContainer = new TexchangeDefaultContainer<BigH>(
			this[TECRETARY_BASE_TYPES.timeline](),
			this[TECRETARY_BASE_TYPES.hFactory](),
			this[TECRETARY_BASE_TYPES.hStatic](),
			bigHFactory.from(1000),
			bigHFactory.from(7000),
		);
		return new Map<string, Texchange<BigH>>([[
			'binance-perpetual-btcusdt',
			texchangeContainer[TEXCHANGE_DEFAULT_TYPES.texchange](),
		]]);
	});
	public [TECRETARY_BASE_TYPES.hFactory] = this.rv<HFactory<BigH>>(bigHFactory);
	public [TECRETARY_BASE_TYPES.hStatic] = this.rv<HStatic<BigH>>(BigH);
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
		() => this[TECRETARY_BASE_TYPES.startTime]() + 1 * 1 * 60 * 1000,
	);
	public [TECRETARY_BASE_TYPES.Strategy] = this.rv<StrategyStaticLike<BigH>>(Strategy);
}

const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[TECRETARY_BASE_TYPES.tecretary]();

adapt(
	tecretary,
	3000,
	3000,
	3000,
);
