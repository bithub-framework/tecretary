"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortMergeAll = exports.sortMerge = void 0;
const sortMerge = (cmp) => function* (it1, it2) {
    try {
        let r1 = it1.next();
        let r2 = it2.next();
        while (!r1.done || !r2.done) {
            if (r1.done) {
                yield r2.value;
                r2 = it2.next();
            }
            else if (r2.done) {
                yield r1.value;
                r1 = it1.next();
            }
            else if (cmp(r1.value, r2.value) < 0) {
                yield r1.value;
                r1 = it1.next();
            }
            else {
                yield r2.value;
                r2 = it2.next();
            }
        }
    }
    finally {
        if (it1.return)
            it1.return();
        if (it2.return)
            it2.return();
    }
};
exports.sortMerge = sortMerge;
const sortMergeAll = (cmp) => (...iterators) => iterators.reduce((0, exports.sortMerge)(cmp));
exports.sortMergeAll = sortMergeAll;
//# sourceMappingURL=merge.js.map