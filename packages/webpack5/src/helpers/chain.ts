import { ChainedSet } from 'webpack-chain';

/**
 * Helper to insert values after a specific item in a ChainedSet.
 *
 * @param chainedSet
 * @param after
 * @param itemToAdd
 */
export function chainedSetAddAfter(
	chainedSet: ChainedSet<any>,
	after: any,
	itemToAdd: any
) {
	const values = chainedSet.values();

	if (values.includes(after)) {
		values.splice(values.indexOf(after) + 1, 0, itemToAdd);
	} else {
		values.push(itemToAdd);
	}

	chainedSet.clear().merge(values);
}
