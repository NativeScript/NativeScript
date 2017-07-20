import { ViewBase } from "../ui/core/view";
import { CSSComputedStyleProperty } from "./css-agent";
export declare function getNodeById(id: number): DOMNode;
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
