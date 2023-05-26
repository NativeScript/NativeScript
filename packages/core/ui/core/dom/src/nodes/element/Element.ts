import QuerySelector from '../../query-selector/QuerySelector';
import { createAttributeFilter, findWhere, splice } from '../../utils';
import XMLParser from '../../xml-parser/XMLParser';
import XMLSerializer from '../../xml-serializer';
import type HTMLElement from '../html-element/HTMLElement';
import type HTMLSlotElement from '../html-slot-element/HTMLSlotElement';
import type Node from '../node/Node';
import NodeList from '../node/NodeList';
import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
import { LightDOM } from '../shadow-root/LightDOM';
import { LIGHT_DOM_REF, RETAIN_MARKER, SHADOW_NODE } from '../shadow-root/ShadowNode';
import { ShadowRoot } from '../shadow-root/ShadowRoot';
import { DOMTokenList } from './DOMTokenList';

export interface IAttr {
	namespaceURI: string;
	name: string;
	value?: any;
}

/**
 * Element.
 */
export default class Element extends ParentNode {
	_tagName: string;
	attributes: IAttr[] = [];
	_shadowRoot: ShadowRoot = null;
	_lightDOM: LightDOM = null;
	id: string;
	_classList: DOMTokenList;
	public namespaceURI: string = 'http://www.w3.org/1999/xhtml';
	static _observedAttributes: string[];
	static observedAttributes: string[];
	constructor() {
		super();
		this.attributes = [];
		this.nodeType = this.ELEMENT_NODE;
	}

	get classList() {
		return this._classList || (this._classList = new DOMTokenList(this));
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

	get className() {
		return this.getAttribute('class') || '';
	}
	set className(val) {
		this.setAttribute('class', val);
	}

	get innerHTML() {
		return new XMLSerializer().serializeToString(this as never, { innerHTML: true });
	}

	set innerHTML(html: string) {
		let currentNode = this.firstChild;
		while (currentNode) {
			const nextSibling = currentNode.nextSibling;
			currentNode.remove();
			currentNode = nextSibling;
		}

		if (html === '') return;
		const nodes = XMLParser.parse(this.ownerDocument, html).childNodes.slice();
		for (const node of nodes) {
			this.appendChild(node);
		}
	}

	/**
	 * Get text value of children.
	 *
	 * @returns Text content.
	 */
	public get textContent(): string {
		let result = '';
		let currentNode = this.firstChild;
		while (currentNode) {
			if (currentNode.nodeType === NodeTypeEnum.elementNode || currentNode.nodeType === NodeTypeEnum.textNode) {
				result += (currentNode as Element).textContent;
			}
			currentNode = currentNode.nextSibling;
		}
		return result;
	}

	/**
	 * Sets text content.
	 *
	 * @param textContent Text content.
	 */
	public set textContent(textContent: string) {
		for (const child of this.childNodes) {
			this.removeChild(child);
		}
		if (textContent) {
			this.appendChild(this.ownerDocument.createTextNode(textContent));
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
		this[name] = null;
		if (!this.attributeChangedCallback || !(<typeof Element>this.constructor)._observedAttributes || !(<typeof Element>this.constructor)._observedAttributes.includes(name)) {
			splice(this.attributes, createAttributeFilter(namespace, name), false, false);
			return;
		}
		const oldValue = this.getAttribute(name);
		splice(this.attributes, createAttributeFilter(namespace, name), false, false);
		this.attributeChangedCallback(name, oldValue, null);
	}

	/**
	 * Returns a boolean value indicating whether the specified element has the attribute or not.
	 *
	 * @param name Attribute name.
	 * @returns True if attribute exists, false otherwise.
	 */
	public hasAttribute(name: string): boolean {
		return !!this.attributes.some((attribute) => attribute.name === name);
	}

	/**
	 * Returns a boolean value indicating whether the specified element has the namespace attribute or not.
	 *
	 * @param namespace Namespace URI.
	 * @param localName Local name.
	 * @returns True if attribute exists, false otherwise.
	 */
	public hasAttributeNS(namespace: string, localName: string): boolean {
		return !!this.attributes.some((attribute) => attribute.name === localName && attribute.namespaceURI === namespace);
	}

	hasAttributes(): boolean {
		return !!this.attributes.length;
	}

	getAttributeNames(): string[] {
		return this.attributes.map((attribute) => attribute.name);
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
		this._lightDOM = new LightDOM(LIGHT_DOM_REF, this);
		// // Add childern back to Light DOM
		// // If they are slottable, they will
		// // get rendered again in the
		// // Shadow Tree.
		this.append(...childNodes);
		return shadow;
	}

	appendChild(node: Node) {
		return this.insertBefore(node, undefined);
	}
	insertBefore(newNode: Node, referenceNode: Node) {
		newNode.canRender = true;
		if (!this._shadowRoot || newNode[SHADOW_NODE]) {
			return super.insertBefore(newNode, referenceNode);
		}

		const slot = this._shadowRoot._slots.get((newNode as any).slot);
		if (slot) {
			(newNode as any).assignedSlot = slot;
			this._lightDOM.insertBefore(newNode, referenceNode);
			slot.insertBefore(newNode, referenceNode);
			if (newNode[SHADOW_NODE]) super.insertBefore(newNode, referenceNode);
			slot.dispatchSlotChangeEvent();
		} else {
			// Ensures that this node does not render in the native view tree.
			newNode.canRender = false;
			// Insert the node in DOM, this will get moved to it's
			// slottable parent automatically when a slot is available.
			super.insertBefore(newNode, referenceNode);
			this._lightDOM.insertBefore(newNode, referenceNode);
		}
		return newNode;
	}

	replaceChild(newChild: Node, oldChild: Node) {
		newChild.canRender = true;
		if (!this._shadowRoot || newChild[SHADOW_NODE]) {
			return super.replaceChild(newChild, oldChild);
		}

		const slot = this._shadowRoot._slots.get((newChild as any).slot);
		if (slot) {
			(newChild as any).assignedSlot = slot;
			this._lightDOM.replaceChild(newChild, oldChild);
			slot.replaceChild(newChild, oldChild);
			newChild.canRender = true;
			if (newChild[SHADOW_NODE]) super.replaceChild(newChild, oldChild);
			slot.dispatchSlotChangeEvent();
		} else {
			// Ensures that this node does not render in the native view tree.
			newChild.canRender = false;
			// Insert the node in DOM, this will get moved to it's
			// slottable parent automatically when a slot is available.
			super.replaceChild(newChild, oldChild);
			this._lightDOM.replaceChild(newChild, oldChild);
		}
		return newChild;
	}
	removeChild(node: any) {
		node.canRender = true;
		if (!this._shadowRoot || node[SHADOW_NODE]) {
			if (node[SHADOW_NODE]) {
				node[SHADOW_NODE] = false;
				node._rootNode = null;
			}
			return super.removeChild(node);
		}

		const slot = (this as any)._shadowRoot._slots.get((node as any).slot);
		if (slot && node.assignedSlot) {
			(node as HTMLElement).assignedSlot = slot;
			if (!node[RETAIN_MARKER] && this._lightDOM) this._lightDOM.removeChild(node);
			slot.removeChild(node);
			slot.dispatchSlotChangeEvent();
		} else {
			// Ensures that this node can render in the native view tree.
			super.removeChild(node);
			if (!node[RETAIN_MARKER] && this._lightDOM) this._lightDOM.removeChild(node);
		}
	}

	/**
	 * The matches() method checks to see if the Element would be selected by the provided selectorString.
	 *
	 * @param selector Selector.
	 * @returns "true" if matching.
	 */
	public matches(selector: string): boolean {
		return QuerySelector.match(this, selector).matches;
	}

	/**
	 * Traverses the Element and its parents (heading toward the document root) until it finds a node that matches the provided selector string.
	 *
	 * @param selector Selector.
	 * @returns Closest matching element.
	 */
	public closest(selector: string): Element {
		let rootElement: Element = this.ownerDocument.documentElement;
		if (!this.parentNode) {
			// eslint-disable-next-line
			rootElement = this;
			while (rootElement.parentNode) {
				rootElement = rootElement.parentNode as Element;
			}
		}
		const elements = rootElement.querySelectorAll(selector);

		// eslint-disable-next-line
		let parent: Element = this;
		while (parent) {
			if (elements.includes(parent)) {
				return parent;
			}
			parent = parent.parentNode as Element;
		}

		// QuerySelectorAll() will not match the element it is looking in when searched for
		// Therefore we need to check if it matches the root
		if (rootElement.matches(selector)) {
			return rootElement;
		}

		return null;
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
const updateAttributeNS = (self: Element, namespace: string, name: string, value: any) => {
	let attr = findWhere(self.attributes, createAttributeFilter(namespace, name), false, false);
	if (!attr) self.attributes.push((attr = { namespaceURI: namespace, name } as IAttr));
	if (attr.value === value) return;
	attr.value = value;
	if (self.canRender && self['isNativeElement']) {
		self[name] = value;
	}

	if (self.attributeChangedCallback && (<typeof Element>self.constructor)._observedAttributes && (<typeof Element>self.constructor)._observedAttributes.includes(name)) {
		self.attributeChangedCallback(name, attr.value, value);
	}
};
