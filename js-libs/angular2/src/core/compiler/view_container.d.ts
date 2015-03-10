import { View, ProtoView } from './view';
import { Element } from 'angular2/src/facade/dom';
import { Injector } from 'angular2/di';
import { ElementInjector } from 'angular2/src/core/compiler/element_injector';
import { EventManager } from 'angular2/src/core/events/event_manager';
export declare class ViewContainer {
    parentView: View;
    templateElement: Element;
    defaultProtoView: ProtoView;
    _views: List<View>;
    _lightDom: any;
    _eventManager: EventManager;
    elementInjector: ElementInjector;
    appInjector: Injector;
    hostElementInjector: ElementInjector;
    constructor(parentView: View, templateElement: Element, defaultProtoView: ProtoView, elementInjector: ElementInjector, eventManager: EventManager, lightDom?: any);
    hydrate(appInjector: Injector, hostElementInjector: ElementInjector): void;
    dehydrate(): void;
    clear(): void;
    get(index: number): View;
    length: number;
    _siblingToInsertAfter(index: number): any;
    hydrated(): boolean;
    create(atIndex?: number): View;
    insert(view: any, atIndex?: number): View;
    remove(atIndex?: number): void;
    /**
     * The method can be used together with insert to implement a view move, i.e.
     * moving the dom nodes while the directives in the view stay intact.
     */
    detach(atIndex?: number): View;
    contentTagContainers(): List<View>;
    nodes(): List<Node>;
    _linkElementInjectors(view: any): void;
    _unlinkElementInjectors(view: any): void;
    static moveViewNodesAfterSibling(sibling: any, view: any): void;
    static removeViewNodesFromParent(parent: any, view: any): void;
}
