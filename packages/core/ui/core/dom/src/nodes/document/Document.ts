import ElementTag from '../../config/ElementTag';
import DOMImplementation from '../../dom-implementation/DOMImplementation';
import { Event } from '../../event/Event';
import INodeFilter from '../../tree-walker/INodeFilter';
import TreeWalker from '../../tree-walker/TreeWalker';
import Comment from '../comment/Comment';
import DocumentFragment from '../document-fragment/DocumentFragment';
import HTMLElement from '../html-element/HTMLElement';
import type Node from '../node/Node';
import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
import Text from '../text/Text';

const createElement = (type: string, owner: Document) => {
	let element;

	if (htmlElementRegistry.has(type)) {
		const Class = htmlElementRegistry.get(type) as any;
		element = new Class();
		element.tagName = Class.NODE_TAG_NAME;
	} else if (ElementTag[type]) {
		element = new ElementTag[type]();
		element.tagName = type;
	} else if (customElements.get(type)) {
		element = new (customElements.get(type))();
		element.tagName = type;
	} else {
		element = new HTMLElement();
		element.tagName = type;
	}
	element.ownerDocument = owner;
	element._isRegisteredDOMElement = true;
	return element;
};

/**
 * Document.
 */
export default class Document extends ParentNode {
	_defaultView = undefined;
	documentElement: HTMLElement;
	head: HTMLElement;
	body: HTMLElement;
	implementation: DOMImplementation;
	nodeType: NodeTypeEnum = NodeTypeEnum.documentNode;
	isParentNode = true;
	/* eslint-disable class-methods-use-this */
	constructor() {
		super();
		this.nodeName = '#document';
		this.localName = '#document';
		this.implementation = new DOMImplementation(this);
		const doctype = this.implementation.createDocumentType('html', '', '');
		this.appendChild(doctype as any);
	}
	/**
	 * Once the document gets created, you must call this method to
	 * attach `html`, `head` and `body` elements to the document.
	 *
	 * ```ts
	 * const window = new Window();
	 * window.document.initDocument('html', 'ContentView');
	 * ```
	 * @param documentElement
	 * @param body
	 */
	initDocument(documentElement = 'html', body = 'body') {
		this.documentElement = this.createElement(documentElement);
		this.head = this.createElement('head');
		this.body = this.createElement(body);
		this.documentElement.appendChild(this.head);
		this.documentElement.appendChild(this.body);
		document.appendChild(document.documentElement);
	}

	createDocumentFragment() {
		return new DocumentFragment();
	}

	createElement(type: string) {
		return createElement(type, this);
	}

	createElementNS(namespace: string, type: string) {
		const element = this.createElement(type);
		//@ts-ignore
		element.namespaceURI = namespace;
		return element;
	}

	createComment(data: string) {
		return new Comment(data);
	}

	createTextNode(text: string) {
		return new Text(text);
	}

	createEvent(type: string) {
		return new Event(type);
	}

	get defaultView() {
		return this._defaultView;
	}
	set defaultView(scope: any) {
		this._defaultView = scope;
	}

	/**
	 * Creates a Tree Walker.
	 *
	 * @param root Root.
	 * @param [whatToShow] What to show.
	 * @param [filter] Filter.
	 */
	public createTreeWalker(root: Node, whatToShow = -1, filter: INodeFilter = null): TreeWalker {
		return new TreeWalker(root, whatToShow, filter);
	}

	/**
	 * Imports a node.
	 *
	 * @param node Node to import.
	 * @param [deep=false] Set to "true" if the clone should be deep.
	 */
	public importNode(node: Node, deep = false): Node {
		if (!node.isNode) {
			throw new Error('Parameter 1 was not of type Node.');
		}
		const clone = node.cloneNode(deep);
		(<Document>clone.ownerDocument) = this;
		return clone;
	}
}

Document.prototype['adoptedStyleSheets'] = [];
