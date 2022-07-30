// https://github.com/WiseLibs/better-sqlite3/issues/78
// It's not guaranteed to be a Generator.

export interface DatabaseIterable<T> {
	[Symbol.iterator](): Iterator<T>;
	return(): void;
}
