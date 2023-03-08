import { DOMUtils } from './../../utils/index';
import HTMLElement from '../html-element/HTMLElement';
import Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';

export type ParentPropType = 'array' | 'key';

/**
 * An element whose childern are set as an attribute
 * on the parent.
 */
export class HTMLPropBaseElement extends HTMLElement {
	/**
	 * The prop on the parent that should be set by this
	 * prop element
	 */
	public _key: string = undefined;
	/**
	 * The type of prop, can be an "array" or a "key" prop.
	 */
	public _type: ParentPropType = undefined;

	public _value: any = undefined;

	constructor(key: string, type: ParentPropType = 'key') {
		super(NodeTypeEnum.elementNode, 'prop');
		if (key) this.key = key;
		if (type) this.type = type;
	}

	get key() {
		return this._key;
	}
	set key(value: string) {
		if (this._key === value) return;
		// If the key has changed, reset the current prop
		if (this.parentNode && this._key) (this.parentNode as HTMLElement)[this.key] = null;
		this._key = value;
		this.setProp();
	}

	get type() {
		return this._type || 'key';
	}

	set type(value: unknown) {
		if (this._type || this._value) {
			if (process.env.NODE_ENV !== 'production') console.warn('[DOM] Prop type cannot be changed once set or when children exist.');
			return;
		}
		if (value !== 'array') return;

		this._type = value;
		if (value === 'array') {
			this._value = [];
			const children = this.childNodes.slice();
			for (const i of children) this.appendChild(i);
		}
		this.setProp();
	}

	get value() {
		if (this.parentNode && this._key) this._value = (this.parentNode as HTMLElement)[this.key];
		return this._value;
	}

	set value(value) {
		this._value = value;
		this.setProp();
	}

	get class() {
		return `${this._key}:${this._type}`;
	}

	set class(value: string) {
		const [key, type] = value.split(':');
		if (type) this._type = type as ParentPropType;
		if (key) this._key = key;
	}

	get className() {
		return `${this._key}:${this._type}`;
	}
	set className(val) {
		this.class = val;
	}

	public setProp() {
		if (!this._key || !this.parentNode) return;
		(this.parentNode as HTMLElement)[this.key] = this._value;
	}
}

class HTMLPropElement extends HTMLPropBaseElement {
	insertBefore(newNode: Node, referenceNode: Node): Node {
		super.insertBefore(newNode, referenceNode);
		if (Array.isArray(this._value)) {
			DOMUtils.addToArrayProp(this, '_value', newNode, referenceNode);
			if (this.key && this.parentNode && this._value !== this.parentNode[this.key]) DOMUtils.addToArrayProp(this.parentNode, this.key, newNode, referenceNode);
		} else {
			this.value = newNode;
		}
		return newNode;
	}

	removeChild(node: any) {
		if (this.type === 'array') {
			DOMUtils.removeFromArrayProp(this, '_value', node);
			if (this._key && this.parentNode) DOMUtils.removeFromArrayProp(this.parentNode, this.key, node);
		} else if (this.value === node) this.value = null;

		super.removeChild(node);
	}
}

export class HTMLKeyPropElement extends HTMLPropElement {
	constructor(key: string) {
		super(key, 'key');
	}
}

export class HTMLArrayPropElement extends HTMLPropElement {
	constructor(key: string) {
		super(key, 'array');
	}
}
