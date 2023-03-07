import DocumentFragment from '../document-fragment/DocumentFragment';
import NodeTypeEnum from '../node/NodeTypeEnum';
import ParentNode from '../parent-node/ParentNode';
import HTMLElement from '../html-element/HTMLElement';
import Comment from '../comment/Comment';
import Text from '../text/Text';
import { Event } from '../../event/Event';

const createElement = (type: string, owner: Document) => {
	//@ts-ignore
	if (htmlElementRegistry && htmlElementRegistry[type]) {
		//@ts-ignore
		const element = new htmlElementRegistry[type]();
		element.ownerDocument = owner;
		//@ts-ignore
		element.tagName = htmlElementRegistry[type].NODE_TAG_NAME;
		element._isRegisteredDOMElement = true;
		return element;
	}
	return new HTMLElement(NodeTypeEnum.elementNode, type);
};

/**
 * Document.
 */
export default class Document extends ParentNode {
	_defaultView = undefined;
	nodeType: NodeTypeEnum = NodeTypeEnum.documentNode;
	/* eslint-disable class-methods-use-this */
	constructor() {
		super();
		this.nodeName = '#document';
		this.localName = '#document';
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
}
