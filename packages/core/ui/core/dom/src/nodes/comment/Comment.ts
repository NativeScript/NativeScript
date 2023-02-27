import Node from '../node/Node';
import CharacterData from '../character-data/CharacterData';

/**
 * Comment node.
 */
export default class Comment extends CharacterData {
	public readonly nodeType = Node.COMMENT_NODE;

	/**
	 * Node name.
	 *
	 * @returns Node name.
	 */
	nodeName = '#comment';

	constructor(comment: string) {
		super();
		this.data = comment;
		this.textContent = comment;
	}

	/**
	 * Converts to string.
	 *
	 * @returns String.
	 */
	public toString(): string {
		return '[object Comment]';
	}

	/**
	 * Clones a node.
	 *
	 * @override
	 * @param [deep=false] "true" to clone deep.
	 * @returns Cloned node.
	 */
	public cloneNode(deep = false): Comment {
		return <Comment>super.cloneNode(deep);
	}
}
