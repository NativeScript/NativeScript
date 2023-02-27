import Node from '../node/Node';
import CharacterData from '../character-data/CharacterData';

/**
 * Text node.
 */
export default class Text extends CharacterData {
	public readonly nodeType = Node.TEXT_NODE;

	/**
	 * Node name.
	 *
	 * @returns Node name.
	 */
	public nodeName = '#text';

	constructor(text: string) {
		super();
		this.data = text;
		this.textContent = text;
	}

	/**
	 * Converts to string.
	 *
	 * @returns String.
	 */
	public toString(): string {
		return '[object Text]';
	}

	/**
	 * Clones a node.
	 *
	 * @override
	 * @param [deep=false] "true" to clone deep.
	 * @returns Cloned node.
	 */
	public cloneNode(deep = false): Text {
		return <Text>super.cloneNode(deep);
	}
}
