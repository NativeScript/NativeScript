import Node from './Node';

/**
 * Class list.
 */
export default class NodeList extends Array {
	/**
	 * Returns `Symbol.toStringTag`.
	 *
	 * @returns `Symbol.toStringTag`.
	 */
	public get [Symbol.toStringTag](): string {
		return this.constructor.name;
	}

	/**
	 * Returns item by index.
	 *
	 * @param index Index.
	 */
	public item(index: number): Node {
		return index >= 0 && this[index] ? this[index] : null;
	}
}
