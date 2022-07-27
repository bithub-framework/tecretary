export interface DatabaseIterableIterator<T> extends IterableIterator<T> {
    return(): IteratorResult<T>;
}
