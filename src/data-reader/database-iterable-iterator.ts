// https://github.com/WiseLibs/better-sqlite3/issues/78
// It's not guaranteed to be a Generator.

export interface DatabaseIterableIterator<T> extends IterableIterator<T> {
	return(): IteratorResult<T>;
}
