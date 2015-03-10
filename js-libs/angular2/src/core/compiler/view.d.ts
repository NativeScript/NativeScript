import { Element } from 'angular2/src/facade/dom';
import { AST, ContextWithVariableBindings, ProtoChangeDetector, ChangeDetector, ChangeRecord } from 'angular2/change_detection';
import { ProtoElementInjector, ElementInjector, PreBuiltObjects } from './element_injector';
import { ElementBinder } from './element_binder';
import { DirectiveMetadata } from './directive_metadata';
import { Injector } from 'angular2/di';
import { ViewContainer } from './view_container';
import { LightDom } from './shadow_dom_emulation/light_dom';
import { ShadowDomStrategy } from './shadow_dom_strategy';
import { ViewPool } from './view_pool';
import { EventManager } from 'angular2/src/core/events/event_manager';
/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 */
export declare class View {
    rootElementInjectors: List<ElementInjector>;
    elementInjectors: List<ElementInjector>;
    bindElements: List<Element>;
    textNodes: List<Text>;
    changeDetector: ChangeDetector;
    nodes: List<Node>;
    componentChildViews: List<View>;
    viewContainers: List<ViewContainer>;
    preBuiltObjects: List<PreBuiltObjects>;
    proto: ProtoView;
    context: any;
    contextWithLocals: ContextWithVariableBindings;
    constructor(proto: ProtoView, nodes: List<Node>, protoChangeDetector: ProtoChangeDetector, protoContextLocals: Map<any, any>);
    init(elementInjectors: List<any>, rootElementInjectors: List<any>, textNodes: List<any>, bindElements: List<any>, viewContainers: List<any>, preBuiltObjects: List<any>, componentChildViews: List<any>): void;
    setLocal(contextName: string, value: any): void;
    hydrated(): boolean;
    _hydrateContext(newContext: any): void;
    _dehydrateContext(): void;
    /**
     * A dehydrated view is a state of the view that allows it to be moved around
     * the view tree, without incurring the cost of recreating the underlying
     * injectors and watch records.
     *
     * A dehydrated view has the following properties:
     *
     * - all element injectors are empty.
     * - all appInjectors are released.
     * - all viewcontainers are empty.
     * - all context locals are set to null.
     * - the view context is null.
     *
     * A call to hydrate/dehydrate does not attach/detach the view from the view
     * tree.
     */
    hydrate(appInjector: Injector, hostElementInjector: ElementInjector, context: Object): void;
    dehydrate(): void;
    onRecordChange(directiveMemento: any, records: List<any>): void;
    _invokeMementos(records: List<any>): void;
    _notifyDirectiveAboutChanges(directiveMemento: any, records: List<any>): void;
    _invokeMementoFor(record: ChangeRecord): void;
    _collectChanges(records: List<any>): Object;
}
export declare class ProtoView {
    element: Element;
    elementBinders: List<ElementBinder>;
    protoChangeDetector: ProtoChangeDetector;
    variableBindings: Map<any, any>;
    protoContextLocals: Map<any, any>;
    textNodesWithBindingCount: int;
    elementsWithBindingCount: int;
    instantiateInPlace: boolean;
    rootBindingOffset: int;
    isTemplateElement: boolean;
    shadowDomStrategy: ShadowDomStrategy;
    _viewPool: ViewPool;
    constructor(template: Element, protoChangeDetector: ProtoChangeDetector, shadowDomStrategy: ShadowDomStrategy);
    instantiate(hostElementInjector: ElementInjector, eventManager: EventManager): View;
    _preFillPool(hostElementInjector: ElementInjector, eventManager: EventManager): void;
    _instantiate(hostElementInjector: ElementInjector, eventManager: EventManager): View;
    returnToPool(view: View): void;
    static buildInnerCallback(expr: AST, view: View): (event: any) => void;
    _directParentElementLightDom(protoElementInjector: ProtoElementInjector, preBuiltObjects: List<any>): LightDom;
    bindVariable(contextName: string, templateName: string): void;
    bindElement(protoElementInjector: ProtoElementInjector, componentDirective?: DirectiveMetadata, viewportDirective?: DirectiveMetadata): ElementBinder;
    /**
     * Adds a text node binding for the last created ElementBinder via bindElement
     */
    bindTextNode(indexInParent: int, expression: AST): void;
    /**
     * Adds an element property binding for the last created ElementBinder via bindElement
     */
    bindElementProperty(expression: AST, setterName: string, setter: SetterFn): void;
    /**
     * Adds an event binding for the last created ElementBinder via bindElement
     */
    bindEvent(eventName: string, expression: AST): void;
    /**
     * Adds a directive property binding for the last created ElementBinder via bindElement
     */
    bindDirectiveProperty(directiveIndex: number, expression: AST, setterName: string, setter: SetterFn, isContentWatch: boolean): void;
    static createRootProtoView(protoView: ProtoView, insertionElement: any, rootComponentAnnotatedType: DirectiveMetadata, protoChangeDetector: ProtoChangeDetector, shadowDomStrategy: ShadowDomStrategy): ProtoView;
}
export declare class ElementBindingMemento {
    _elementIndex: int;
    _setterName: string;
    _setter: SetterFn;
    constructor(elementIndex: int, setterName: string, setter: SetterFn);
    invoke(record: ChangeRecord, bindElements: List<Element>): void;
}
export declare class DirectiveBindingMemento {
    _elementInjectorIndex: int;
    _directiveIndex: int;
    _setterName: string;
    _setter: SetterFn;
    constructor(elementInjectorIndex: number, directiveIndex: number, setterName: string, setter: SetterFn);
    invoke(record: ChangeRecord, elementInjectors: List<ElementInjector>): void;
}
