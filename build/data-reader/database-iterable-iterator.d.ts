export interface DatabaseIterable<T> {
    [Symbol.iterator](): Iterator<T>;
    return(): void;
}
