import HTMLElement from '../nodes/html-element/HTMLElement';
import Node from '../nodes/node/Node';

/**
 * Custom elements registry.
 */
export default class CustomElementRegistry {
	private _registry: Map<string, { elementClass: typeof HTMLElement; extends: string }> = new Map();
	private _callbacks: { [k: string]: (() => void)[] } = {};

	/**
	 * Defines a custom element class.
	 *
	 * @param tagName Tag name of element.
	 * @param elementClass Element class.
	 * @param [options] Options.
	 * @param options.extends
	 */
	public define(tagName: string, elementClass: typeof HTMLElement, options?: { extends: string }): void {
		if (!tagName.includes('-')) {
			throw new Error("[DOM] Failed to execute 'define' on 'CustomElementRegistry': \"" + tagName + '" is not a valid custom element name.');
		}

		this._registry.set(tagName, {
			elementClass,
			extends: options && options.extends ? options.extends.toLowerCase() : null,
		});

		// ObservedAttributes should only be called once by CustomElementRegistry
		if (elementClass.prototype.attributeChangedCallback) {
			elementClass._observedAttributes = elementClass.observedAttributes;
		}

		if (this._callbacks[tagName]) {
			const callbacks = this._callbacks[tagName];
			delete this._callbacks[tagName];
			for (const callback of callbacks) {
				callback();
			}
		}
	}

	/**
	 * Returns a defined element class.
	 *
	 * @param tagName Tag name of element.
	 * @param HTMLElement Class defined.
	 */
	public get(tagName: string): typeof HTMLElement {
		return this._registry.has(tagName) ? this._registry.get(tagName).elementClass : undefined;
	}

	/**
	 * Upgrades a custom element directly, even before it is connected to its shadow root.
	 *
	 * Not implemented yet.
	 *
	 * @param _root Root node.
	 */
	public upgrade(_root: Node): void {
		// Do nothing
	}

	/**
	 * When defined.
	 *
	 * @param tagName Tag name of element.
	 * @returns Promise.
	 */
	public whenDefined(tagName: string): Promise<void> {
		if (this.get(tagName)) {
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			this._callbacks[tagName] = this._callbacks[tagName] || [];
			this._callbacks[tagName].push(resolve);
		});
	}
}
