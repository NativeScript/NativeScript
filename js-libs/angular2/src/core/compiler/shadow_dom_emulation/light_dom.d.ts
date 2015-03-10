import { Element } from 'angular2/src/facade/dom';
import { View } from '../view';
import { ElementInjector } from '../element_injector';
import { Content } from './content_tag';
export declare class SourceLightDom {
}
export declare class DestinationLightDom {
}
export declare class _Root {
    node: Node;
    injector: ElementInjector;
    constructor(node: any, injector: any);
}
export declare class LightDom {
    lightDomView: View;
    shadowDomView: View;
    nodes: List<Node>;
    roots: List<_Root>;
    constructor(lightDomView: View, shadowDomView: View, element: Element);
    redistribute(): void;
    contentTags(): List<Content>;
    _collectAllContentTags(view: View, acc: List<Content>): List<Content>;
    expandedDomNodes(): List<any>;
    _roots(): List<_Root>;
}
