import { createAttributeFilter, findWhere, splice } from '../../utils';
import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';

// eslint-disable-next-line max-params
const updateAttributeNS = (self: Element, ns: string, name: string, value: any) => {
	let attr = findWhere(self.attributes, createAttributeFilter(ns, name), false, false);
	if (!attr) self.attributes.push((attr = { ns, name } as never));
	attr.value = value;
};

/**
 * Element.
 */
export default class Element extends ParentNode {
	attributes: { ns: string; name: string; value?: any }[] = [];
	constructor(nodeType: NodeTypeEnum, localName: string) {
		super();
		this.nodeType = nodeType;
		this.localName = localName;
		this.nodeName = localName;
		this.attributes = [];
	}

	get tagName() {
		return this.nodeName;
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
		return this.getAttribute('class');
	}
	set className(val) {
		this.setAttribute('class', val);
	}

	// Actually innerHTML and outerHTML is out of DOM's spec
	// But we just put it here for some frameworks to work
	// Or warn people not trying to treat undom like a browser
	get innerHTML() {
		const serializedChildren: string[] = [];
		let currentNode = this.firstChild;
		while (currentNode) {
			serializedChildren.push(new XMLSerializer().serializeToString(currentNode as never));
			currentNode = currentNode.nextSibling;
		}
		return ''.concat(...serializedChildren);
	}

	set innerHTML(value) {
		// Setting innerHTML with an empty string just clears the element's children
		if (value === '') {
			let currentNode = this.firstChild;
			while (currentNode) {
				const nextSibling = currentNode.nextSibling;
				currentNode.remove();
				currentNode = nextSibling;
			}
			return;
		}

		throw new Error(`[UNDOM-NG] Failed to set 'innerHTML' on '${this.localName}': Not implemented.`);
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

		throw new Error(`[UNDOM-NG] Failed to set 'outerHTML' on '${this.localName}': Not implemented.`);
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
		splice(this.attributes, createAttributeFilter(namespace, name), false, false);
	}
}
