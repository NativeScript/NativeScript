import type Element from '../element/Element';
import Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';
import { escape } from 'html-escaper';
import NodeList from '../node/NodeList';
import type { View } from '../../../../view';
import QuerySelector from '../../query-selector/QuerySelector';
/**
 * Parent node
 */
export default class ParentNode extends Node {
	isParentNode = true;
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
		for (const node of nodes) {
			this.appendChild(node);
		}
	}

	prepend(...nodes: Node[]) {
		const prependBeforeChild = this.firstElementChild;
		for (const node of nodes) {
			this.insertBefore(node, prependBeforeChild);
		}
	}

	replaceChildren(...nodes: Node[]) {
		for (const node of this.childNodes) {
			node.remove();
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
				if (textContent) textArr.push(escape(textContent) as never);
			}
			currentNode = currentNode.nextSibling;
		}

		return ''.concat(...textArr);
	}
	set textContent(val) {
		this._textContent = val;
	}

	getElementsByTagName(tagName: string) {
		if (!this.firstChild) return [];
		const elements = new NodeList();
		let current = this.firstChild as Element;
		const tagNameUpper = tagName.toUpperCase();
		while (current) {
			if (current.nodeType === NodeTypeEnum.elementNode || current.nodeType === NodeTypeEnum.textNode) {
				if (current.tagName === tagNameUpper) elements.push(current);

				if (current.firstChild) {
					const matches = current.getElementsByTagName(tagName);
					if (matches.length) elements.push(...matches);
				}
			}
			current = current.nextSibling as Element;
		}
		return elements;
	}

	getElementsByClassName(className: string) {
		if (!this.firstChild) return [];
		const elements = new NodeList();
		let current = this.firstChild as unknown as View;
		while (current) {
			if (current.nodeType === NodeTypeEnum.elementNode || current.nodeType === NodeTypeEnum.textNode) {
				if (current.cssClasses && current.cssClasses.has(className)) {
					elements.push(current);
				} else if (current.className.split(' ').includes(className)) {
					elements.push(current);
				}

				if (current.firstChild) {
					const matches = current.getElementsByClassName(className);
					if (matches.length) elements.push(...matches);
				}
			}
			current = current.nextSibling as View;
		}
		return elements;
	}

	public getElementById(id: string) {
		let element: Element;
		let current = this.firstChild as unknown as View;
		while (current) {
			if (current.nodeType === NodeTypeEnum.elementNode || current.nodeType === NodeTypeEnum.textNode) {
				if (current.id === id) return current;

				if (current.firstChild) {
					if ((element = current.getElementById(id) as any)) return element;
				}
			}
			current = current.nextSibling as unknown as View;
		}
		return element;
	}

	/**
	 * Query CSS selector to find matching nodes.
	 *
	 * @param selector CSS selector.
	 * @returns Matching elements.
	 */
	public querySelectorAll(selector: string): NodeList<Element> {
		return QuerySelector.querySelectorAll(this, selector);
	}

	/**
	 * Query CSS Selector to find matching node.
	 *
	 * @param selector CSS selector.
	 * @returns Matching element.
	 */
	public querySelector(selector: string): Element {
		return QuerySelector.querySelector(this, selector);
	}
	/**
	 * A callback that fires for element's observed attributes.
	 * @param name
	 * @param oldValue
	 * @param newValue
	 */
}
