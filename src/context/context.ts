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

import { ContextMarket } from './market';

import { inject } from '@zimtsui/injektor';
import { TYPES } from '../injection/types';



export class Context<H extends HLike<H>> implements ContextLike<H> {
    [marketId: number]: MarketLike<H>;

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
        const texchanges: Texchange<H>[] = config.marketNames.map(name => {
            const texchange = texchangeMap.get(name);
            assert(typeof texchange !== 'undefined');
            return texchange;
        });

        for (let i = 0; i < texchanges.length; i++) {
            this[i] = new ContextMarket(texchanges[i]);
        }
    }

    public submit(content: string): void {
        this.progressReader.log(
            content,
            this.timeline.now(),
        );
    }
}
