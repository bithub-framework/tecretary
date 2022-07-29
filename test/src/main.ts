import {
	Texchange,
	DefaultContainer as TexchangeContainer,
	DEFAULT_TYPES as TEXCHANGE_TYPES,
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
	BigDecimalH as H,
	bigDecimalHFactory as hFactory,
} from 'high-precision';
import { Strategy } from './strategy';
import { adapt } from 'startable-adaptor';


class TECRETARY_TYPES extends TECRETARY_BASE_TYPES { }

class TecretaryContainer extends TecretaryBaseContainer<H> {
	public [TECRETARY_TYPES.config] = this.rv<Config>({
		projectName: 'test',
		marketNames: ['binance-perpetual-btcusdt'],
		snapshotPeriod: Number.POSITIVE_INFINITY,
		continue: false,
	});
	public [TECRETARY_TYPES.texchangeMap] = this.rfs<Map<string, Texchange<H>>>(() => {
		const texchangeContainer = new TexchangeContainer<H>(
			this[TECRETARY_TYPES.timeline](),
			this[TECRETARY_TYPES.TexchangeDataTypes](),
			hFactory.from(1000),
			hFactory.from(7000),
		);
		return new Map<string, Texchange<H>>([[
			'binance-perpetual-btcusdt',
			texchangeContainer[TEXCHANGE_TYPES.texchange](),
		]]);
	});
	public [TECRETARY_TYPES.hFactory] = this.rv<HFactory<H>>(hFactory);
	public [TECRETARY_TYPES.hStatic] = this.rv<HStatic<H>>(H);
	public [TECRETARY_TYPES.progressFilePath] = this.rv<string>(
		'../progress.db',
	);
	public [TECRETARY_TYPES.dataFilePath] = this.rv<string>(
		'/media/1tb/tecretary.db',
	);
	public [TECRETARY_TYPES.startTime] = this.rv<number>(
		1577807996537,
	);
	public [TECRETARY_TYPES.endTime] = this.rfs<number>(
		() => this[TECRETARY_TYPES.startTime]() + 1 * 20 * 60 * 1000,
	);
	public [TECRETARY_TYPES.Strategy] = this.rv<StrategyStaticLike<H>>(Strategy);
}

const tecretaryContainer = new TecretaryContainer();
const tecretary = tecretaryContainer[TECRETARY_TYPES.tecretary]();

adapt(
	tecretary,
	3000,
	3000,
	3000,
);
