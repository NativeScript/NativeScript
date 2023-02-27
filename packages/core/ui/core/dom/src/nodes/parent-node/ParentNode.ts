import type Element from '../element/Element';
import Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';

/**
 * Parent node
 */
export default class ParentNode extends Node {
	get childElementCount() {
		let count = 0;

		let currentNode = this.firstElementChild;
		while (currentNode) {
			count += 1;
			//@ts-ignore
			currentNode = currentNode.nextElementSibling;
		}

		return count;
	}

	get firstElementChild(): Element {
		const currentNode = this.firstChild;
		//@ts-ignore
		if (!currentNode) return null;
		if (currentNode.nodeType === NodeTypeEnum.elementNode) return currentNode as Element;
		return currentNode.nextElementSibling as Element;
	}

	get lastElementChild(): Element {
		const currentNode = this.lastChild;
		//@ts-ignore
		if (!currentNode) return null;
		if (currentNode.nodeType === NodeTypeEnum.elementNode) return currentNode as Element;
		return currentNode.previousElementSibling as Element;
	}

	get children() {
		const children: Element[] = [];
		let currentNode = this.firstElementChild;
		while (currentNode) {
			children.push(currentNode);
			//@ts-ignore
			currentNode = currentNode.nextElementSibling;
		}

		return children;
	}

	append(...nodes: Node[]) {
		for (const i of nodes) {
			this.appendChild(i);
		}
	}

	replaceChildren(...nodes: Node[]) {
		for (const old of nodes) {
			old.remove();
		}

		for (const node of nodes) {
			this.appendChild(node);
		}
	}

	get textContent() {
		const textArr: string[] = [];

		let currentNode = this.firstChild;
		while (currentNode) {
			if (currentNode.nodeType !== 8) {
				const textContent = currentNode._textContent;
				if (textContent) textArr.push(textContent as never);
			}
			currentNode = currentNode.nextSibling;
		}

		return ''.concat(...textArr);
	}
	set textContent(val) {
		this._textContent = val;
	}
}
