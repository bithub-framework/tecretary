export declare const sortMerge: <T>(cmp: (a: T, b: T) => number) => (it1: Iterator<T, any, undefined>, it2: Iterator<T, any, undefined>) => Generator<T, void, unknown>;
export declare const sortMergeAll: <T>(cmp: (a: T, b: T) => number) => (...iterators: Iterator<T, any, undefined>[]) => Iterator<T, any, undefined>;
