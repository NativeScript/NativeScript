import { Observable } from '../../../../../data/observable';
import AbortSignal from '../event/AbortSignal';
import { Event } from '../event/Event';
import { CustomEvent } from '../event/CustomEvent';
import CharacterData from '../nodes/character-data/CharacterData';
import Comment from '../nodes/comment/Comment';
import DocumentFragment from '../nodes/document-fragment/DocumentFragment';
import Document from '../nodes/document/Document';
import Element from '../nodes/element/Element';
import HTMLElement from '../nodes/html-element/HTMLElement';
import Node from '../nodes/node/Node';
import NodeList from '../nodes/node/NodeList';
import SVGElement from '../nodes/svg-element/SVGElement';
import Text from '../nodes/text/Text';
import XMLSerializer from '../xml-serializer';
import { HTMLKeyPropElement, HTMLArrayPropElement } from '../nodes/html-prop-element/HTMLPropElement';
import HTMLSlotElement from '../nodes/html-slot-element/HTMLSlotElement';
import { HTMLItemTemplateElement } from '../nodes/html-item-template-element/HTMLItemTemplateElement';
import HTMLTemplateElement from '../nodes/html-template-element/HTMLTemplateElement';
import { ShadowRoot } from '../nodes/shadow-root/ShadowRoot';
import DocumentType from '../nodes/document-type/DocumentType';
import CustomElementRegistry from '../custom-element/CustomElementRegistry';
import NodeFilter from '../tree-walker/NodeFilter';
import TreeWalker from '../tree-walker/TreeWalker';
import { CSSStyleSheet } from '../cssstylesheet/CSSStyleSheet';

declare global {
	// eslint-disable-next-line no-var
	var htmlElementRegistry: Map<string, HTMLElement>;
}

/**
 * Browser window.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window.
 */
export default class Window {
	public readonly Node = Node;
	public readonly HTMLElement = HTMLElement;
	public readonly Text = Text;
	public readonly Comment = Comment;
	public readonly Element = Element;
	public readonly DocumentFragment = DocumentFragment;
	public readonly CharacterData = CharacterData;
	public readonly Document = Document;
	public readonly Event = Event;
	public readonly EventTarget = Observable;
	public readonly XMLSerializer = XMLSerializer;
	public readonly NodeList = NodeList;
	public readonly AbortSignal = AbortSignal;
	public readonly SVGElement = SVGElement;
	public readonly CustomEvent = CustomEvent;
	public readonly HTMLKeyPropElement = HTMLKeyPropElement;
	public readonly HTMLArrayPropElement = HTMLArrayPropElement;
	public readonly HTMLSlotElement = HTMLSlotElement;
	public readonly HTMLItemTemplateElement = HTMLItemTemplateElement;
	public readonly HTMLTemplateElement = HTMLTemplateElement;
	public readonly ShadowRoot = ShadowRoot;
	public readonly DocumentType = DocumentType;
	public readonly document: Document;
	public readonly self: Window;
	public readonly customElements: CustomElementRegistry;
	public readonly CustomElementRegistry = CustomElementRegistry;
	public readonly NodeFilter = NodeFilter;
	public readonly TreeWalker = TreeWalker;
	public readonly setTimeout = globalThis.setTimeout;
	public readonly setInterval = globalThis.setInterval;
	public readonly clearInterval = globalThis.clearInterval;
	public readonly clearTimeout = globalThis.clearTimeout;
	public readonly clearImmediate = globalThis.clearImmediate;
	public readonly setImmediate = globalThis.setImmediate;
	public readonly location = {};
	constructor() {
		this.document = new Document();
		this.document.defaultView = this;
		globalThis.htmlElementRegistry = new Map();
		globalThis.registerElement = this.registerElement;
		this.self = this;
		this.customElements = new CustomElementRegistry();
	}

	registerElement(name: string, element: HTMLElement) {
		if (!htmlElementRegistry.has(name)) {
			//@ts-ignore
			element.NODE_TAG_NAME = name;
			//@ts-ignore
			element.prototype['cssType'] = name;
			//@ts-ignore
			globalThis.htmlElementRegistry.set(name, element);
		}
	}

	bindToGlobal() {
		//@ts-ignore
		globalThis.window = this;
		//@ts-ignore
		globalThis.document = this.document;
		//@ts-ignore
		globalThis.self = this;
		//@ts-ignore
		globalThis.Node = Node;
		//@ts-ignore
		globalThis.HTMLElement = HTMLElement;
		//@ts-ignore
		globalThis.Text = Text;
		//@ts-ignore
		globalThis.Comment = Comment;
		//@ts-ignore
		globalThis.Element = Element;
		//@ts-ignore
		globalThis.DocumentFragment = DocumentFragment;
		//@ts-ignore
		globalThis.CharacterData = CharacterData;
		//@ts-ignore
		globalThis.Document = Document;
		//@ts-ignore
		globalThis.Event = Event;
		//@ts-ignore
		globalThis.EventTarget = Observable;
		//@ts-ignore
		globalThis.XMLSerializer = XMLSerializer;
		//@ts-ignore
		globalThis.SVGElement = SVGElement;
		//@ts-ignore
		globalThis.NodeList = NodeList;
		//@ts-ignore
		globalThis.AbortSignal = AbortSignal;
		//@ts-ignore
		globalThis.CustomEvent = CustomEvent;
		globalThis.HTMLKeyPropElement = HTMLKeyPropElement;
		globalThis.HTMLArrayPropElement = HTMLArrayPropElement;
		//@ts-ignore
		globalThis.HTMLSlotElement = HTMLSlotElement;
		//@ts-ignore
		globalThis.HTMLTemplateElement = HTMLTemplateElement;
		//@ts-ignore
		globalThis.ShadowRoot = ShadowRoot;
		//@ts-ignore
		globalThis.DocumentType = DocumentType;
		//@ts-ignore
		globalThis.CustomElementRegistry = CustomElementRegistry;
		//@ts-ignore
		globalThis.customElements = this.customElements;
		globalThis.NodeFilter = NodeFilter;
		//@ts-ignore
		globalThis.TreeWalker = TreeWalker;
		//@ts-ignore
		globalThis.CSSStyleSheet = CSSStyleSheet;
		return this;
	}

	public getComputedStyle(element: Element) {
		return element['style'];
	}
}
