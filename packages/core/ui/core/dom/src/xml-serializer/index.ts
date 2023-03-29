/* eslint-disable no-case-declarations */
import Element from '../nodes/element/Element';
import VoidElements from '../config/VoidElements';
import DocumentType from '../nodes/document-type/DocumentType';
import { escape } from 'html-escaper';
import Node from '../nodes/node/Node';
import HTMLTemplateElement from '../nodes/html-template-element/HTMLTemplateElement';

/**
 * Utility for converting an element to string.
 * https://github.com/capricorn86/happy-dom/blob/master/packages/happy-dom/src/xml-serializer/XMLSerializer.ts
 */
export default class XMLSerializer {
	/**
	 * Renders an element as HTML.
	 *
	 * @param root Root element.
	 * @param [options] Options.
	 * @param [options.includeShadowRoots] Set to "true" to include shadow roots.
	 * @returns Result.
	 */
	public serializeToString(root: Node, options?: { includeShadowRoots?: boolean; innerHTML?: boolean }): string {
		const rootNode = (root as Element).tagName === 'TEMPLATE' ? (<HTMLTemplateElement>root).content : root;
		switch (root.nodeType) {
			case Node.ELEMENT_NODE:
				const element = <Element>rootNode;
				const tagName = element.tagName.toLowerCase();

				if (VoidElements.includes(tagName)) {
					return `<${tagName}${this._getAttributes(element)}>`;
				}

				let innerHTML = '';
				let currentNode = element.firstChild;
				while (currentNode) {
					innerHTML += this.serializeToString(currentNode, { ...options, innerHTML: false });
					currentNode = currentNode.nextSibling;
				}

				if (options?.includeShadowRoots && element.shadowRoot) {
					innerHTML += `<template shadowroot="${element.shadowRoot.mode}">`;

					for (const node of element.shadowRoot.childNodes) {
						innerHTML += this.serializeToString(node, { ...options, innerHTML: false });
					}

					innerHTML += '</template>';
				}
				if (options.innerHTML) {
					return innerHTML;
				} else {
					return `<${tagName}${this._getAttributes(element)}>${innerHTML}</${tagName}>`;
				}
			case Node.DOCUMENT_FRAGMENT_NODE:
			case Node.DOCUMENT_NODE: {
				let html = '';
				let currentNode = rootNode.firstChild;
				while (currentNode) {
					html += this.serializeToString(currentNode, { ...options, innerHTML: false });
					currentNode = currentNode.nextSibling;
				}
				return html;
			}
			case Node.COMMENT_NODE:
				return `<!--${root._textContent}-->`;
			case Node.TEXT_NODE:
				return root['textContent'];
			case Node.DOCUMENT_TYPE_NODE:
				const doctype = <DocumentType>root;
				const identifier = doctype.publicId ? ' PUBLIC' : doctype.systemId ? ' SYSTEM' : '';
				const publicId = doctype.publicId ? ` "${doctype.publicId}"` : '';
				const systemId = doctype.systemId ? ` "${doctype.systemId}"` : '';
				return `<!DOCTYPE ${doctype.name}${identifier}${publicId}${systemId}>`;
		}

		return '';
	}

	/**
	 * Returns attributes as a string.
	 *
	 * @param element Element.
	 * @returns Attributes.
	 */
	private _getAttributes(element: Element): string {
		let attributeString = '';

		// if (!(<Element>element)._attributes.is && (<Element>element)._isValue) {
		// 	attributeString += ' is="' + escape((<Element>element)._isValue) + '"';
		// }

		for (const attribute of (<Element>element).attributes) {
			if (attribute.value !== null) {
				attributeString += ' ' + attribute.name + '="' + escape(attribute.value) + '"';
			}
		}
		return attributeString;
	}
}
