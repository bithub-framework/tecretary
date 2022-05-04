export declare const sortMerge: <T>(cmp: (a: T, b: T) => number) => (...iterators: Iterator<T, any, undefined>[]) => Iterator<T, any, undefined>;
