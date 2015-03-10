import { NgElement } from 'angular2/src/core/dom/element';
export declare class ContentStrategy {
    nodes: List<Node>;
    insert(nodes: List<Node>): void;
}
export declare class Content {
    select: string;
    _strategy: ContentStrategy;
    constructor(destinationLightDom: any, contentEl: NgElement);
    nodes(): List<Node>;
    insert(nodes: List<Node>): void;
}
