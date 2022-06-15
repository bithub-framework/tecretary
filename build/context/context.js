"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const assert = require("assert");
const market_1 = require("./market");
const injektor_1 = require("@zimtsui/injektor");
const types_1 = require("../injection/types");
let Context = class Context {
    constructor(config, texchangeMap, timeline, progressReader) {
        this.timeline = timeline;
        this.progressReader = progressReader;
        const texchanges = config.marketNames.map(name => {
            const texchange = texchangeMap.get(name);
            assert(typeof texchange !== 'undefined');
            return texchange;
        });
        for (let i = 0; i < texchanges.length; i++) {
            this[i] = new market_1.ContextMarket(texchanges[i]);
        }
    }
    submit(content) {
        this.progressReader.log(content, this.timeline.now());
    }
};
Context = __decorate([
    __param(0, (0, injektor_1.inject)(types_1.TYPES.config)),
    __param(1, (0, injektor_1.inject)(types_1.TYPES.texchangeMap)),
    __param(2, (0, injektor_1.inject)(types_1.TYPES.timeline)),
    __param(3, (0, injektor_1.inject)(types_1.TYPES.progressReader))
], Context);
exports.Context = Context;
//# sourceMappingURL=context.js.map