import { Element } from 'angular2/src/facade/dom';
export declare class NgElement {
    domElement: Element;
    constructor(domElement: Element);
    getAttribute(name: string): any;
}
