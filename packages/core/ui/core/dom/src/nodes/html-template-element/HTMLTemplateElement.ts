import XMLParser from '../../xml-parser/XMLParser';
import XMLSerializer from '../../xml-serializer';
import type DocumentFragment from '../document-fragment/DocumentFragment';
import HTMLElement from '../html-element/HTMLElement';
import type Node from '../node/Node';

/**
 * HTML Template Element.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement.
 */
export default class HTMLTemplateElement extends HTMLElement {
	public content: DocumentFragment = this.ownerDocument.createDocumentFragment();

	/**
	 * @override
	 */
	public get innerHTML(): string {
		return this.getInnerHTML();
	}

	/**
	 * @override
	 */
	public set innerHTML(html: string) {
		for (const child of this.content.childNodes.slice()) {
			this.content.removeChild(child);
		}

		for (const node of XMLParser.parse(this.ownerDocument, html).childNodes.slice()) {
			this.content.appendChild(node);
		}
	}

	/**
	 * @override
	 */
	//@ts-ignore
	public get firstChild(): Node {
		return this.content.firstChild;
	}

	/**
	 * @override
	 */
	//@ts-ignore
	public get lastChild(): Node {
		return this.content.lastChild;
	}

	/**
	 * @override
	 */
	public getInnerHTML(options?: { includeShadowRoots?: boolean }): string {
		const xmlSerializer = new XMLSerializer();
		let xml = '';
		for (const node of this.content.childNodes) {
			xml += xmlSerializer.serializeToString(node, options);
		}
		return xml;
	}

	/**
	 * @override
	 */
	public appendChild(node: Node): Node {
		return this.content.appendChild(node);
	}

	/**
	 * @override
	 */
	public removeChild(node: Node): Node {
		return this.content.removeChild(node);
	}

	/**
	 * @override
	 */
	public insertBefore(newNode: Node, referenceNode: Node): Node {
		return this.content.insertBefore(newNode, referenceNode);
	}

	/**
	 * @override
	 */
	public replaceChild(newChild: Node, oldChild: Node): Node {
		return this.content.replaceChild(newChild, oldChild);
	}

	/**
	 * @override
	 */
	public cloneNode(deep = false): HTMLTemplateElement {
		const clone = <HTMLTemplateElement>super.cloneNode(deep);
		clone.content = this.content.cloneNode(deep) as DocumentFragment;
		return clone;
	}
}
