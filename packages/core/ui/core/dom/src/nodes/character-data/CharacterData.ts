import type Element from '../element/Element';
import Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';

/**
 * Character data base class.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/CharacterData.
 */
export default abstract class CharacterData extends Node {
	get data(): string {
		return this._nodeValue;
	}

	set data(data) {
		this._nodeValue = data;
		propogateTextChangeToParentElement(this);
	}
	get length() {
		return this._nodeValue.length;
	}

	get nodeValue() {
		return this._nodeValue;
	}
	set nodeValue(data) {
		this._nodeValue = data;
		propogateTextChangeToParentElement(this);
	}

	get textContent() {
		return this._nodeValue;
	}
	set textContent(text) {
		this._nodeValue = `${text}`;
		propogateTextChangeToParentElement(this);
	}

	appendData(data: string) {
		this._nodeValue += data;
	}
}

function propogateTextChangeToParentElement(node: Node) {
	let parentElement: Element = null;
	let currentNode = node.parentNode;
	while (currentNode && !parentElement) {
		if (currentNode.nodeType === NodeTypeEnum.elementNode) {
			parentElement = currentNode as Element;
		}
		currentNode = currentNode.parentNode;
	}
	if (!parentElement) return;

	if ('text' in parentElement) {
		parentElement['text'] = parentElement.textContent;
	}
}
