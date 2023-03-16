import type HTMLElement from '../html-element/HTMLElement';
import type Node from '../node/Node';
import { LightDOM } from './LightDOM';

/**
 * A mixin that adds support for Light DOM
 *
 * If child is added from shadow, it's a rendered node, otherwise it's part of the light dom.
 * Nodes that are part of the light DOM get rendered in their respective named slots. If no slot is found
 * and the default slot is not present, those nodes are not rendered in the shadow dom but still show up
 * in the light dom.
 */
export class ShadowHostMixin {
	_lightDOM: LightDOM = new LightDOM();
	appendChild(node: Node, shadow: boolean) {
		if (shadow) {
			/**
			 * The shadow dom requested to append a child,
			 * such childern must be part of the render phase.
			 */
			//@ts-ignore
			super.appendChild(node);
		} else {
			/**
			 * This element is a slottable and part of the light dom.
			 * We will look up a valid slot in the Shadow DOM.
			 * If no slot is found, the element is not rendered in DOM
			 * Tree hence it's skipped from render phase.
			 */
			const slot = (this as unknown as HTMLElement)._shadowRoot._slots.get((node as HTMLElement).slot);
			if (slot) {
				(node as HTMLElement).assignedSlot = slot;
				this._lightDOM.appendChild(node);
				slot.appendChild(node);
				slot.dispatchSlotChangeEvent();
			} else {
				this._lightDOM.appendChild(node);
			}
		}
	}
	insertBefore(newNode: Node, referenceNode: Node, shadow: boolean) {
		if (shadow) {
			//@ts-ignore
			super.insertBefore(newNode, referenceNode);
		} else {
			const slot = (this as unknown as HTMLElement)._shadowRoot._slots.get((newNode as HTMLElement).slot);
			const refSlot = (this as unknown as HTMLElement)._shadowRoot._slots.get((referenceNode as HTMLElement).slot);
			if (slot === refSlot) {
				(newNode as HTMLElement).assignedSlot = slot;
				this._lightDOM.insertBefore(newNode, referenceNode);
				slot.insertBefore(newNode, referenceNode);
				slot.dispatchSlotChangeEvent();
			} else {
				this._lightDOM.insertBefore(newNode, referenceNode);
			}
		}
	}
	replaceChild(newChild: Node, oldChild: Node, shadow: boolean) {
		if (shadow) {
			//@ts-ignore
			super.replaceChild(newChild, oldChild);
		} else {
			const slot = (this as unknown as HTMLElement)._shadowRoot._slots.get((newChild as HTMLElement).slot);
			if (slot) {
				(newChild as HTMLElement).assignedSlot = slot;
				this._lightDOM.replaceChild(newChild, oldChild);
				slot.replaceChild(newChild, oldChild);
				slot.dispatchSlotChangeEvent();
			} else {
				this._lightDOM.replaceChild(newChild, oldChild);
			}
		}
	}
	removeChild(node: any, shadow: boolean) {
		if (shadow) {
			//@ts-ignore
			super.removeChild(node);
		} else {
			const slot = (this as unknown as HTMLElement)._shadowRoot._slots.get((node as HTMLElement).slot);
			if (slot) {
				(node as HTMLElement).assignedSlot = slot;
				this._lightDOM.removeChild(node);
				slot.removeChild(node);
				slot.dispatchSlotChangeEvent();
			} else {
				this._lightDOM.removeChild(node);
			}
		}
	}
}
