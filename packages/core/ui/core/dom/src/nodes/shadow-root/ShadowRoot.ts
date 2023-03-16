import DocumentFragment from '../document-fragment/DocumentFragment';
import type HTMLElement from '../html-element/HTMLElement';
import type HTMLSlotElement from '../html-slot-element/HTMLSlotElement';
import type Node from '../node/Node';
import type { ShadowHostMixin } from './ShadowHost';

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
		if (slot.firstChild) {
			for (const node of slot.childNodes as Node[]) {
				node.remove();
			}
		}
		for (const node of nodes) {
			(node as HTMLElement).assignedSlot = slot;
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
		//@ts-ignore
		return (this._host as unknown as ShadowHostMixin).appendChild(node, true);
	}

	insertBefore(newNode: Node, referenceNode: Node): Node {
		//@ts-ignore
		return (this._host as unknown as ShadowHostMixin).insertBefore(newNode, referenceNode, true);
	}

	replaceChild(newChild: Node, oldChild: Node): Node {
		//@ts-ignore
		return (this._host as unknown as ShadowHostMixin).replaceChild(newChild, oldChild, true);
	}

	removeChild(node: any) {
		//@ts-ignore
		(this._host as unknown as ShadowHostMixin).removeChild(node, true);
	}
}
