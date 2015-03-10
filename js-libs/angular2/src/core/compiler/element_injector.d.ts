import { Injector, Key, Dependency, Binding } from 'angular2/di';
import { View } from 'angular2/src/core/compiler/view';
import { LightDom } from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import { ViewContainer } from 'angular2/src/core/compiler/view_container';
import { NgElement } from 'angular2/src/core/dom/element';
import { Directive } from 'angular2/src/core/annotations/annotations';
import { BindingPropagationConfig } from 'angular2/src/core/compiler/binding_propagation_config';
export declare class TreeNode {
    _parent: TreeNode;
    _head: TreeNode;
    _tail: TreeNode;
    _next: TreeNode;
    constructor(parent: TreeNode);
    /**
     * Adds a child to the parent node. The child MUST NOT be a part of a tree.
     */
    _addChild(child: TreeNode): void;
    parent: TreeNode;
    children: any[];
}
export declare class DirectiveDependency extends Dependency {
    depth: int;
    eventEmitterName: string;
    constructor(key: Key, asPromise: boolean, lazy: boolean, properties: List<any>, depth: int, eventEmitterName: string);
    static createFrom(d: Dependency): Dependency;
    static _depth(properties: any): int;
    static _eventEmitterName(properties: any): string;
}
export declare class DirectiveBinding extends Binding {
    callOnDestroy: boolean;
    callOnChange: boolean;
    onCheck: boolean;
    constructor(key: Key, factory: Function, dependencies: List<any>, providedAsPromise: boolean, annotation: Directive);
    static createFromBinding(b: Binding, annotation: Directive): DirectiveBinding;
    static createFromType(type: Type, annotation: Directive): DirectiveBinding;
    static _hasEventEmitter(eventName: string, binding: DirectiveBinding): boolean;
}
export declare class PreBuiltObjects {
    view: View;
    element: NgElement;
    viewContainer: ViewContainer;
    lightDom: LightDom;
    bindingPropagationConfig: BindingPropagationConfig;
    constructor(view: any, element: NgElement, viewContainer: ViewContainer, lightDom: LightDom, bindingPropagationConfig: BindingPropagationConfig);
}
/**

Difference between di.Injector and ElementInjector

di.Injector:
 - imperative based (can create child injectors imperativly)
 - Lazy loading of code
 - Component/App Level services which are usually not DOM Related.


ElementInjector:
  - ProtoBased (Injector structure fixed at compile time)
  - understands @Ancestor, @Parent, @Child, @Descendent
  - Fast
  - Query mechanism for children
  - 1:1 to DOM structure.

 PERF BENCHMARK: http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/
 */
export declare class ProtoElementInjector {
    _binding0: Binding;
    _binding1: Binding;
    _binding2: Binding;
    _binding3: Binding;
    _binding4: Binding;
    _binding5: Binding;
    _binding6: Binding;
    _binding7: Binding;
    _binding8: Binding;
    _binding9: Binding;
    _binding0IsComponent: boolean;
    _keyId0: int;
    _keyId1: int;
    _keyId2: int;
    _keyId3: int;
    _keyId4: int;
    _keyId5: int;
    _keyId6: int;
    _keyId7: int;
    _keyId8: int;
    _keyId9: int;
    parent: ProtoElementInjector;
    index: int;
    view: View;
    distanceToParent: number;
    /** Whether the element is exported as $implicit. */
    exportElement: boolean;
    /** Whether the component instance is exported as $implicit. */
    exportComponent: boolean;
    /** The variable name that will be set to $implicit for the element. */
    exportImplicitName: string;
    constructor(parent: ProtoElementInjector, index: int, bindings: List<any>, firstBindingIsComponent?: boolean, distanceToParent?: number);
    instantiate(parent: ElementInjector, host: ElementInjector, eventCallbacks: any): ElementInjector;
    directParent(): ProtoElementInjector;
    _createBinding(bindingOrType: any): any;
    hasBindings: boolean;
    hasEventEmitter(eventName: string): boolean;
}
export declare class ElementInjector extends TreeNode {
    _proto: ProtoElementInjector;
    _lightDomAppInjector: Injector;
    _shadowDomAppInjector: Injector;
    _host: ElementInjector;
    _obj0: any;
    _obj1: any;
    _obj2: any;
    _obj3: any;
    _obj4: any;
    _obj5: any;
    _obj6: any;
    _obj7: any;
    _obj8: any;
    _obj9: any;
    _preBuiltObjects: any;
    _constructionCounter: any;
    _eventCallbacks: any;
    constructor(proto: ProtoElementInjector, parent: ElementInjector, host: ElementInjector, eventCallbacks: Map<any, any>);
    clearDirectives(): void;
    instantiateDirectives(lightDomAppInjector: Injector, shadowDomAppInjector: Injector, preBuiltObjects: PreBuiltObjects): void;
    _checkShadowDomAppInjector(shadowDomAppInjector: Injector): void;
    get(token: any): any;
    hasDirective(type: Type): boolean;
    hasPreBuiltObject(type: Type): boolean;
    forElement(el: any): boolean;
    /** Gets the NgElement associated with this ElementInjector */
    getNgElement(): any;
    getComponent(): any;
    directParent(): ElementInjector;
    _isComponentKey(key: Key): boolean;
    _new(binding: Binding): any;
    _getByDependency(dep: DirectiveDependency, requestor: Key): any;
    _buildEventEmitter(dep: any): (event: any) => void;
    _getByKey(key: Key, depth: number, requestor: Key): any;
    _appInjector(requestor: Key): Injector;
    _shouldIncludeSelf(depth: int): boolean;
    _getPreBuiltObjectByKeyId(keyId: int): any;
    _getDirectiveByKeyId(keyId: int): any;
    getDirectiveAtIndex(index: int): any;
    getDirectiveBindingAtIndex(index: int): Binding;
    hasInstances(): boolean;
    hasEventEmitter(eventName: string): boolean;
    /** Gets whether this element is exporting a component instance as $implicit. */
    isExportingComponent(): boolean;
    /** Gets whether this element is exporting its element as $implicit. */
    isExportingElement(): boolean;
    /** Get the name to which this element's $implicit is to be assigned. */
    getExportImplicitName(): string;
}
