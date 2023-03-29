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
	public _content: DocumentFragment;
	constructor() {
		super();
		this.nodeName = 'template';
	}

	get content(): DocumentFragment {
		if (!this.ownerDocument) return {} as any;
		return this._content || (this._content = this.ownerDocument.createDocumentFragment());
	}

	set content(document: DocumentFragment) {
		this._content = document;
	}

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
	public set firstChild(node: Node) {
		this.content.firstChild = node;
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
	//@ts-ignore
	public set lastChild(node: Node) {
		this.content.lastChild = node;
	}

	/**
	 * @override
	 */
	public getInnerHTML(options: { includeShadowRoots?: boolean } = { includeShadowRoots: false }): string {
		const xmlSerializer = new XMLSerializer();
		return xmlSerializer.serializeToString(this.content, {
			includeShadowRoots: options.includeShadowRoots,
			innerHTML: true,
		});
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
