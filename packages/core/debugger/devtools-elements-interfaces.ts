//Types
import { DOMNode } from './dom-types';

export interface InspectorCommands {
	// DevTools -> Application communication. Methods that devtools calls when needed.
	getDocument(): string | DOMNode;
	removeNode(nodeId: number): void;
	getComputedStylesForNode(nodeId: number): string | Array<{ name: string; value: string }>;
	setAttributeAsText(nodeId: number, text: string, name: string): void;
}

export interface InspectorEvents {
	// Application -> DevTools communication. Methods that the app should call when needed.
	childNodeInserted(parentId: number, lastId: number, node: DOMNode): void;
	childNodeRemoved(parentId: number, nodeId: number): void;
	attributeModified(nodeId: number, attrName: string, attrValue: string): void;
	attributeRemoved(nodeId: number, attrName: string): void;
}
