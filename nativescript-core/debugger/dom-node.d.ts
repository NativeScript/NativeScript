import { ViewBase } from '../ui/core/view-base';
import { CSSComputedStyleProperty } from './css-agent';
export declare function getNodeById(id: number): DOMNode;
declare class WeakRef<T> {
	constructor(obj: T);
	get(): T;
	clear(): void;
}
export declare class DOMNode {
	nodeId: any;
	nodeType: any;
	nodeName: any;
	localName: any;
	nodeValue: string;
	attributes: string[];
	viewRef: WeakRef<ViewBase>;
	constructor(view: ViewBase);
	loadAttributes(): void;
	readonly children: DOMNode[];
	onChildAdded(childView: ViewBase): void;
	onChildRemoved(view: ViewBase): void;
	attributeModified(name: string, value: any): void;
	attributeRemoved(name: string): void;
	getComputedProperties(): CSSComputedStyleProperty[];
	dispose(): void;
	toJSON(): string;
}
