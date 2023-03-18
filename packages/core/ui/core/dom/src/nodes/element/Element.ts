import QuerySelector from '../../query-selector/QuerySelector';
import { createAttributeFilter, findWhere, splice } from '../../utils';
import XMLParser from '../../xml-parser/XMLParser';
import XMLSerializer from '../../xml-serializer';
import type HTMLSlotElement from '../html-slot-element/HTMLSlotElement';
import NodeList from '../node/NodeList';
import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
import { ShadowHostMixin } from '../shadow-root/ShadowHost';
import { ShadowRoot } from '../shadow-root/ShadowRoot';

/**
 * Element.
 */
export default class Element extends ParentNode {
	_tagName: string;
	attributes: { ns: string; name: string; value?: any }[] = [];
	_shadowRoot: ShadowRoot = null;
	id: string;
	static _observedAttributes: string[];
	static observedAttributes: string[];
	constructor(nodeType: NodeTypeEnum, localName: string) {
		super();
		this.nodeType = nodeType;
		this.localName = localName;
		this.nodeName = localName;
		this.attributes = [];
	}

	assignedSlot: HTMLSlotElement;

	/**
	 * Returns slot.
	 *
	 * @returns Slot.
	 */
	public get slot(): string {
		return this.getAttribute('slot') || '';
	}

	/**
	 * Returns slot.
	 *
	 * @param slot Slot.
	 */
	public set slot(title: string) {
		this.setAttribute('slot', title);
	}

	get tagName() {
		if (!this._tagName) return (this._tagName = this.nodeName.toUpperCase());
		return this._tagName;
	}

	set tagName(name: string) {
		this.nodeName = name;
		this.localName = name;
	}

	get namespaceURI() {
		return 'http://www.w3.org/1999/xhtml';
	}

	set namespaceURI(namespace: string) {
		this.namespaceURI = namespace;
	}

	get className() {
		return this.getAttribute('class') || '';
	}
	set className(val) {
		this.setAttribute('class', val);
	}

	// Actually innerHTML and outerHTML is out of DOM's spec
	// But we just put it here for some frameworks to work
	// Or warn people not trying to treat undom like a browser
	get innerHTML() {
		return new XMLSerializer().serializeToString(this as never, { innerHTML: true });
	}

	set innerHTML(html: string) {
		// Setting innerHTML with an empty string just clears the element's children
		if (html === '') {
			let currentNode = this.firstChild;
			while (currentNode) {
				const nextSibling = currentNode.nextSibling;
				currentNode.remove();
				currentNode = nextSibling;
			}
			return;
		}

		for (const node of XMLParser.parse(this.ownerDocument, html).childNodes.slice()) {
			this.appendChild(node);
		}
	}

	get outerHTML() {
		return new XMLSerializer().serializeToString(this as never);
	}

	set outerHTML(value) {
		// Setting outerHTML with an empty string just removes the element from it's parent
		if (value === '') {
			this.remove();
			return;
		}

		throw new Error(`[DOM] Failed to set 'outerHTML' on '${this.localName}': Not implemented.`);
	}

	get cssText() {
		return this.getAttribute('style');
	}

	set cssText(val) {
		this.setAttribute('style', val);
	}

	setAttribute(name: string, value: unknown) {
		//@ts-ignore
		this.setAttributeNS(null, name, value);
	}
	getAttribute(name: string) {
		//@ts-ignore
		return this.getAttributeNS(null, name);
	}
	removeAttribute(name: string) {
		//@ts-ignore
		this.removeAttributeNS(null, name);
	}

	setAttributeNS(namespace: string, name: string, value: unknown) {
		updateAttributeNS(this, namespace, name, value);
	}

	getAttributeNS(namespace: string, name: string) {
		const attr = findWhere(this.attributes, createAttributeFilter(namespace, name), false, false);
		return attr && attr.value;
	}
	removeAttributeNS(namespace: string, name: string) {
		if (!this.attributeChangedCallback || !(<typeof Element>this.constructor)._observedAttributes || !(<typeof Element>this.constructor)._observedAttributes.includes(name)) {
			splice(this.attributes, createAttributeFilter(namespace, name), false, false);
			return;
		}
		const oldValue = this.getAttribute(name);
		splice(this.attributes, createAttributeFilter(namespace, name), false, false);
		this.attributeChangedCallback(name, oldValue, null);
	}

	get shadowRoot() {
		if (this._shadowRoot && this._shadowRoot.mode === 'open') return this._shadowRoot;
		return null;
	}

	attachShadow({ mode = 'open' }: { mode: 'open' | 'closed' }) {
		if (this._shadowRoot) throw new Error('[DOM] Shadow root cannot be created on a host which already hosts a shadow tree.');
		const shadow = new ShadowRoot({
			ownerDocument: this.ownerDocument,
			mode: mode,
			host: this,
		});

		this._shadowRoot = shadow;
		const childNodes = this.childNodes;
		// Remove any childern from rendered DOM
		for (const node of childNodes) {
			node.remove();
		}
		// Make this element a Shadow Host.
		Object.assign(this, ShadowHostMixin);
		// // Add childern back to Light DOM
		// // If they are slottable, they will
		// // get rendered again in the
		// // Shadow Tree.
		this.append(...childNodes);

		return shadow;
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
	public attributeChangedCallback?(name: string, oldValue: string, newValue: any): void;
}

// eslint-disable-next-line max-params
const updateAttributeNS = (self: Element, ns: string, name: string, value: any) => {
	let attr = findWhere(self.attributes, createAttributeFilter(ns, name), false, false);
	if (!attr) self.attributes.push((attr = { ns, name } as never));
	if (self.attributeChangedCallback && (<typeof Element>self.constructor)._observedAttributes && (<typeof Element>self.constructor)._observedAttributes.includes(name)) {
		self.attributeChangedCallback(name, attr.value, value);
	}
	attr.value = value;
};
