export const sortMerge = <T>(
	cmp: (a: T, b: T) => number,
) => async function* (
	it1: AsyncIterator<T>,
	it2: AsyncIterator<T>,
	): AsyncGenerator<T, void> {
		try {
			let r1 = await it1.next();
			let r2 = await it2.next();
			while (!r1.done || !r2.done) {
				if (r1.done) {
					yield r2.value;
					r2 = await it2.next();
				} else if (r2.done) {
					yield r1.value;
					r1 = await it1.next();
				} else if (cmp(r1.value, r2.value) < 0) {
					yield r1.value;
					r1 = await it1.next();
				} else {
					yield r2.value;
					r2 = await it2.next();
				}
			}
		} finally {
			if (it1.return) await it1.return();
			if (it2.return) await it2.return();
		}
	}

export const sortMergeAll = <T>(cmp: (a: T, b: T) => number) =>
	(...iterators: AsyncIterator<T>[]) =>
		iterators.reduce(sortMerge(cmp));
