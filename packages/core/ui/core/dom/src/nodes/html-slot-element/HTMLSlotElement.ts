import type Element from '../element/Element';
import HTMLElement from '../html-element/HTMLElement';
import type Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';
import { LightDOM } from '../shadow-root/LightDOM';
import type { ShadowHostMixin } from '../shadow-root/ShadowHost';
import type { ShadowRoot } from '../shadow-root/ShadowRoot';

function isNullOrUndefined(value: any) {
	return value === undefined || value === null;
}

const FALLBACK_REF = '__slotFallbackRef';
const SLOTTED_CHILD_REF = '__slotAssignmentRef';
export default class HTMLSlotElement extends HTMLElement {
	private _slotChangeEvent: Event;
	/**
	 * Childern that get rendered when slot has
	 * no assigned nodes or it's assigned nodes get removed.
	 */
	_fallbackChildern: LightDOM = new LightDOM(FALLBACK_REF);

	/**
	 * Childern that are currently/will be rendered in the DOM Tree.
	 * Since slot element does not render any childern in the Shadow DOM.
	 * We keep track of all it's current slotted childern here.
	 */
	_slotAssignments: LightDOM = new LightDOM(SLOTTED_CHILD_REF);
	constructor() {
		super(NodeTypeEnum.elementNode, 'slot');
	}
	/**
	 * Returns the slot name.
	 *
	 * @returns Name.
	 */
	public get name(): string {
		return this.getAttributeNS(null, 'name') || '';
	}

	/**
	 * Sets the slot name.
	 *
	 * @param name Name.
	 */
	public set name(name: string) {
		const oldValue = this.name;
		this.setAttributeNS(null, 'name', name);
		// If the slot name changes, we notify the shadow root.
		const root = this.getRootNode() as ShadowRoot;
		if (root.isShadow && !root._slots.has(name)) {
			const prev = root._slots.get(oldValue);
			if (prev === this) root._slots.delete(oldValue);
			root._slots.set(name, this);
			this.dispatchSlotChangeEvent();
		}
	}

	/**
	 * Returns assigned nodes.
	 *
	 * @param [options] Options.
	 * @param [options.flatten] A boolean value indicating whether to return the assigned nodes of any available child <slot> elements (true) or not (false). Defaults to false.
	 * @returns Nodes.
	 */
	public assignedNodes(options?: { flatten?: boolean }): Node[] {
		const host = (<ShadowRoot>this.getRootNode())?.host;

		if (!host) return [];

		const name = this.name;

		if (!isNullOrUndefined(name)) {
			return this.assignedElements(options);
		}

		return [];
	}

	/**
	 * Returns assigned elements.
	 *
	 * @param [_options] Options.
	 * @param [_options.flatten] A boolean value indicating whether to return the assigned elements of any available child <slot> elements (true) or not (false). Defaults to false.
	 * @returns Nodes.
	 */
	public assignedElements(_options?: { flatten?: boolean }): Element[] {
		const host = (<ShadowRoot>this.getRootNode())?.host as unknown as ShadowHostMixin;
		if (!host) return [];
		if (_options.flatten) {
			return flattenAssignedNodes([], this);
		}

		const name = this.name;
		if (!isNullOrUndefined(name)) {
			const assignedElements = [];
			/**
			 * Look up assigned nodes in the Light DOM.
			 */
			let current = host._lightDOM.firstChild;
			while (current) {
				const node = current.node;
				if (node.slot === name && !node.assignedSlot) {
					assignedElements.push(node);
				}
				current = current.nextSibling;
			}
			return assignedElements;
		}

		return [];
	}

	/**
	 * Clones a node.
	 *
	 * @override
	 * @param [deep=false] "true" to clone deep.
	 * @returns Cloned node.
	 */
	public cloneNode(deep = false): HTMLSlotElement {
		return <HTMLSlotElement>super.cloneNode(deep);
	}

	private _getSlotChangeEvent() {
		return this._slotChangeEvent || (this._slotChangeEvent = new Event('slotchange', { bubbles: true, cancelable: false }));
	}

	dispatchSlotChangeEvent() {
		const event = this._getSlotChangeEvent();
		this.dispatchEvent(event);
	}

	public connectedCallback(): void {
		const root = this.getRootNode() as ShadowRoot;
		if (root.isShadow && !root._slots.has(this.name)) {
			root._slots.set(this.name, this);
			this.dispatchSlotChangeEvent();
		} else {
			// if shadow does not exist then attach assigned fallback content.
			if (!this._slotAssignments.firstChild.node.parentNode) {
				(this.parentNode as HTMLElement).append(...this._slotAssignments.childNodes);
			}
		}
	}

	public disconnectedCallback(): void {
		const root = this.getRootNode() as ShadowRoot;
		if (!root.isShadow) return;
		if (root.isShadow) {
			if (root._slots.get(this.name) !== this) return;
			if (root._slots.delete(this.name)) {
				this.dispatchSlotChangeEvent();
			}
		} else {
			// if shadow does not exist, detach slot assignments from their parent.
			if (this._slotAssignments.firstChild.node.parentNode) {
				for (const node of this._slotAssignments.childNodes) {
					node.remove();
				}
			}
		}
	}

	isFallbackRendered() {
		if (!this._slotAssignments.firstChild) return true;
		return this._slotAssignments.firstChild?.node === this._fallbackChildern.firstChild?.node;
	}

	appendChild(node: Node): Node {
		// If node does not have any assigned slot then it's part of the
		// fallback content.
		if (!(node as Element).assignedSlot && !node[FALLBACK_REF]) {
			this._fallbackChildern.appendChild(node);
			// If fallback content is not rendered, we return here.
			if (!this.isFallbackRendered()) return;
		}

		if (!node[SLOTTED_CHILD_REF]) {
			this._slotAssignments.appendChild(node);
		}
		if (!this.parentNode) return;
		return this.parentNode.appendChild(node);
	}

	insertBefore(newNode: Node, referenceNode: Node): Node {
		if (!(newNode as Element).assignedSlot && !(referenceNode as Element).assignedSlot) {
			this._fallbackChildern.insertBefore(newNode, referenceNode);
			if (!this.isFallbackRendered()) return;
		}

		if (!newNode[SLOTTED_CHILD_REF]) {
			this._slotAssignments.insertBefore(newNode, referenceNode);
		}
		if (!this.parentNode) return;
		return this.parentNode.insertBefore(newNode, referenceNode);
	}

	replaceChild(newChild: Node, oldChild: Node): Node {
		if (!(newChild as Element).assignedSlot && !(newChild as Element).assignedSlot) {
			this._fallbackChildern.replaceChild(newChild, oldChild);
			if (!this.isFallbackRendered()) return;
		}

		if (!newChild[SLOTTED_CHILD_REF]) {
			this._slotAssignments.replaceChild(newChild, oldChild);
		}
		if (!this.parentNode) return;
		return this.parentNode.replaceChild(newChild, oldChild);
	}

	removeChild(node: any) {
		if (!(node as Element).assignedSlot) {
			this._fallbackChildern.removeChild(node);
			if (!this.isFallbackRendered()) return;
		}

		if (node[SLOTTED_CHILD_REF]) {
			this._slotAssignments.removeChild(node);
		}
		if (!this.parentNode) return;
		this.parentNode.removeChild(node);
	}

	renderFallback() {
		if (this._fallbackChildern.childrenCount > 0) {
			if (this._fallbackChildern.firstChild?.node !== this._slotAssignments.firstChild?.node) {
				for (const node of this._fallbackChildern.childNodes) {
					this.appendChild(node);
				}
			}
			return;
		}
	}
}

function flattenAssignedNodes(nodes: Node[], node: HTMLSlotElement) {
	// Get assigned nodes of this node
	const assignedNodes = node.assignedElements();
	for (const child of assignedNodes) {
		if (child.nodeName === 'slot') {
			// Flatten any child slot elements
			flattenAssignedNodes(nodes, child as HTMLSlotElement);
		} else {
			nodes.push(child);
		}
	}
	return nodes as Element[];
}
