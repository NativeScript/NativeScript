import DocumentFragment from '../document-fragment/DocumentFragment';
import type Element from '../element/Element';
import type HTMLElement from '../html-element/HTMLElement';
import type HTMLSlotElement from '../html-slot-element/HTMLSlotElement';
import type Node from '../node/Node';
import NodeList from '../node/NodeList';
import NodeTypeEnum from '../node/NodeTypeEnum';
import { BIND_SLOTTABLE, RETAIN_MARKER, SHADOW_NODE } from './ShadowNode';
class Slots {
	private _shadowRoot: ShadowRoot;
	private _slots: Map<string, HTMLSlotElement> = new Map();
	constructor(shadow: ShadowRoot) {
		this._shadowRoot = shadow;
	}

	get(name: string) {
		return this._slots.get(name);
	}

	has(name: string) {
		return this._slots.has(name);
	}

	set(name: string, slot: HTMLSlotElement) {
		/**
		 * Once a slot is connected to DOM, we look up for
		 * any available slottables and assign them to this
		 * slot. If there's already a slot with the same name,
		 * this slot get's ignored.
		 */
		this._slots.set(name, slot);
		const nodes = slot.assignedNodes();
		// If no assigned nodes are found, we render fallback childern.
		if (!nodes.length && slot.parentNode) {
			slot.renderFallback();
			return;
		}
		// Remove fallback content
		let fallbackNodes = [];
		if (slot.firstChild) {
			fallbackNodes = slot.childNodes;
			for (const node of fallbackNodes as Node[]) {
				node.remove();
			}
		}
		for (const node of nodes) {
			// Detach the node from light parent while keeping
			// the ref in lightDOM.
			this._shadowRoot._detachFromLightParent(node as Element);
			(node as HTMLElement).assignedSlot = slot;
			node[BIND_SLOTTABLE] = true;
			slot.appendChild(node);
			node[BIND_SLOTTABLE] = false;
		}

		for (const node of fallbackNodes) {
			// We add back fallback nodes to the tree,
			// however they won't take part in
			// rendering.
			slot.appendChild(node);
		}
	}

	delete(name: string) {
		const slot = this._slots.get(name);
		if (!slot) return;
		const deleted = this._slots.delete(name);
		if (deleted) {
			for (const child of slot.childNodes) {
				(child as HTMLElement).assignedSlot = undefined;
				child.remove();
				// When child gets removed, add it back
				// to lightDOM's parent.
				// const lightDOMRef = child['__lightRef'];
				// if (lightDOMRef) {
				// 	const lightParent = lightDOMRef?.dom?.parent;
				// 	if (lightParent) {
				// 		const nextSibling = lightDOMRef.nextSibling;
				// 		lightDOMRef?.dom.removeChild(child);
				// 		lightParent.insertBefore(child, nextSibling?.node);
				// 	}
				// }
			}
		}
		return deleted;
	}
}

export class ShadowRoot extends DocumentFragment {
	_mode: 'open' | 'closed' = 'open';
	_host: Node;
	_slots: Slots;
	isShadow: boolean = true;
	constructor({ mode, ownerDocument, host }: { mode: 'open' | 'closed'; ownerDocument: any; host: Node }) {
		super();
		this._mode = mode;
		this.nodeName = '#shadow-root';
		this.localName = '#shadow-root';
		//@ts-ignore
		this.ownerDocument = ownerDocument;
		this._host = host;
		this._slots = new Slots(this);
	}

	_getTheParent(event: Event) {
		if (event.composed) return this._host;
		return null;
	}

	get mode(): 'open' | 'closed' {
		return this._mode;
	}

	get host(): Node {
		return this._host;
	}

	appendChild(node: Node): Node {
		// Childern added by shadow-root are real nodes and attached to host and rendered.
		// Childern added directly to the host are light dom nodes and are not actually rendered.
		// How to diff between the two cases?
		return this.insertBefore(node, undefined);
	}

	insertBefore(newNode: Node, referenceNode: Node): Node {
		newNode[SHADOW_NODE] = true;
		newNode._rootNode = this;
		// If this element is a document fragment node, insert it's children
		// into the host. The document fragment is discarded.
		if (newNode.nodeType === NodeTypeEnum.documentFragmentNode) {
			for (const child of newNode.childNodes) {
				// remove from document fragment
				child.remove();
				child[SHADOW_NODE] = true;
				child._rootNode = this;
				// Insert into the host before reference node.
				this._host.insertBefore(child, referenceNode);
			}
		} else {
			this._detachFromLightParent(newNode as Element);
			this._host.insertBefore(newNode, referenceNode);
		}

		return newNode;
	}

	adoptStyles(node: Node) {
		if (node['isNativeElement']) {
			const adoptedStyles = this['adoptedStyleSheets'];
			if (adoptedStyles?.length) {
				for (const styles of adoptedStyles) {
					const cssText = (styles.cssRules as unknown as Array<CSSRule>).map((rule) => rule.cssText).join('');
					node['_updateStyleScope'](undefined, cssText);
				}
			}
		}
	}

	public _detachFromLightParent(node: Element) {
		if (!node.canRender && node.parentNode) {
			node[RETAIN_MARKER] = true;
			node.remove();
			node[RETAIN_MARKER] = false;
		}
		node.canRender = true;
	}

	replaceChild(newChild: Node, oldChild: Node): Node {
		this._detachFromLightParent(newChild as Element);

		newChild[SHADOW_NODE] = true;
		newChild._rootNode = this;
		return this._host.replaceChild(newChild, oldChild);
	}

	removeChild(node: any) {
		node._rootNode = null;
		this._host.removeChild(node);
	}

	/**
	 * Query CSS selector to find matching nodes.
	 *
	 * @param selector CSS selector.
	 * @returns Matching elements.
	 */
	public querySelectorAll(selector: string): NodeList<Element> {
		return ((this.host as Element).parentNode as Element).querySelectorAll(selector);
	}

	/**
	 * Query CSS Selector to find matching node.
	 *
	 * @param selector CSS selector.
	 * @returns Matching element.
	 */
	public querySelector(selector: string): Element {
		return ((this.host as Element).parentNode as Element).querySelector(selector);
	}
	/**
	 * A callback that fires for element's observed attributes.
	 * @param name
	 * @param oldValue
	 * @param newValue
	 */
}
ShadowRoot.prototype['adoptedStyleSheets'] = [];
