import type Element from '../element/Element';
import HTMLElement from '../html-element/HTMLElement';
import type Node from '../node/Node';
import { LightDOM } from '../shadow-root/LightDOM';
import { BIND_SLOTTABLE, FALLBACK_REF, SHADOW_NODE, SLOTTED_CHILD_REF } from '../shadow-root/ShadowNode';
import type { ShadowRoot } from '../shadow-root/ShadowRoot';

function isNullOrUndefined(value: any) {
	return value === undefined || value === null;
}

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
	 * We keep track of all it's current slotted childern that are attached
	 * with it's nearest native parent element.
	 */
	_slotAssignments: LightDOM = new LightDOM(SLOTTED_CHILD_REF);
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
	public assignedNodes(options: { flatten?: boolean } = { flatten: false }): Node[] {
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
	public assignedElements(_options: { flatten?: boolean } = { flatten: false }): Element[] {
		const host = (<ShadowRoot>this.getRootNode())?.host as Element;
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
			let current = (host as any)._lightDOM.firstChild;
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
		const clone = <HTMLSlotElement>super.cloneNode(deep);
		return clone;
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
		if (root.isShadow) {
			// Only one slot with a specific slot name can render
			// slottables.
			if (root._slots.has(this.name)) return;
			root._slots.set(this.name, this);
			this.dispatchSlotChangeEvent();
		} else {
			// if shadow does not exist then attach assigned fallback content.
			if (!this._slotAssignments.firstChild?.node.parentNode) {
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
			if (this._slotAssignments.firstChild?.node.parentNode) {
				for (const node of this._slotAssignments.childNodes) {
					node.remove();
				}
			}
		}
	}

	isFallbackRendered() {
		if (!this._slotAssignments.firstChild) return true;
		return this._slotAssignments.firstChild.node === this._fallbackChildern.firstChild.node;
	}

	appendChild(node: Node): Node {
		return this.insertBefore(node, undefined);
	}

	insertBefore(newNode: Node, referenceNode: Node): Node {
		if (!(newNode as Element).assignedSlot) {
			this._fallbackChildern.insertBefore(newNode, referenceNode);
			if (!this.isFallbackRendered()) {
				newNode.canRender = false;
			}
		}

		if (!newNode[SLOTTED_CHILD_REF]) {
			this._slotAssignments.insertBefore(newNode, referenceNode);
		}

		// If slottable is not yet attached to DOM, return.
		if (!this.parentNode) return;

		newNode[SHADOW_NODE] = true;
		newNode._rootNode = this._rootNode;
		if (newNode[BIND_SLOTTABLE] || newNode[FALLBACK_REF]) {
			this.parentNode.insertBefore(newNode, referenceNode);
		}
		return newNode;
	}

	replaceChild(newChild: Node, oldChild: Node): Node {
		if (!(newChild as Element).assignedSlot && !(newChild as Element).assignedSlot) {
			this._fallbackChildern.replaceChild(newChild, oldChild);
			if (!this.isFallbackRendered()) {
				newChild.canRender = false;
			}
		}

		if (!newChild[SLOTTED_CHILD_REF]) {
			this._slotAssignments.replaceChild(newChild, oldChild);
		}
		if (!this.parentNode) return;
		newChild[SHADOW_NODE] = true;
		newChild._rootNode = this._rootNode;

		if (newChild[BIND_SLOTTABLE] || newChild[FALLBACK_REF]) {
			this.parentNode.replaceChild(newChild, oldChild);
		}
		return newChild;
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
		node[SHADOW_NODE] = false;
		node._rootNode = null;
		this.parentNode.removeChild(node);
	}

	renderFallback() {
		if (this._fallbackChildern.childrenCount > 0 && this._fallbackChildern.firstChild?.node !== this._slotAssignments.firstChild?.node) {
			for (const node of this._fallbackChildern.childNodes) {
				if (node.parentNode) node.remove();
				node.canRender = true;
				this.appendChild(node);
			}
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
