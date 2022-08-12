import {
    MarketLike,
    ContextLike,
    HLike,
    TimelineLike,
    DataTypesNamespace as SecretaryDataTypesNamespace,
} from 'secretary-like';
import { Texchange } from 'texchange';
import { ProgressReader } from '../progress-reader';
import { Config } from '../config';
import assert = require('assert');
import { createStartable } from 'startable';

import { ContextMarket } from './market';

import { inject } from '@zimtsui/injektor';
import { TYPES } from '../injection/types';



export class Context<H extends HLike<H>> implements ContextLike<H> {
    [marketId: number]: MarketLike<H>;

    public $s = createStartable(
        this.rawStart.bind(this),
        this.rawStop.bind(this),
    );

    private texchanges: Texchange<H>[];

    constructor(
        @inject(TYPES.config)
        config: Config,
        @inject(TYPES.texchangeMap)
        texchangeMap: Map<string, Texchange<H>>,
        @inject(TYPES.TexchangeDataTypes)
        public DataTypes: SecretaryDataTypesNamespace<H>,
        @inject(TYPES.timeline)
        public timeline: TimelineLike,
        @inject(TYPES.progressReader)
        private progressReader: ProgressReader<H>,
    ) {
        this.texchanges = config.marketNames.map(name => {
            const texchange = texchangeMap.get(name);
            assert(typeof texchange !== 'undefined');
            return texchange;
        });

        for (let i = 0; i < this.texchanges.length; i++) {
            this[i] = new ContextMarket(this.texchanges[i]);
        }
    }

    public submit(content: string): void {
        this.progressReader.log(
            content,
            this.timeline.now(),
        );
    }

    private async rawStart() {
        await this.progressReader.$s.start(this.$s.stop);
        for (const texchange of this.texchanges) {
            const facade = texchange.getAdminFacade();
            await facade.$s.start(this.$s.stop);
        }
    }

    private async rawStop() { }
}
