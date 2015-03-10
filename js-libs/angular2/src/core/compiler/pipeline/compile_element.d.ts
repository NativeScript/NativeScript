import { Element } from 'angular2/src/facade/dom';
import { DirectiveMetadata } from '../directive_metadata';
import { ElementBinder } from '../element_binder';
import { ProtoElementInjector } from '../element_injector';
import { ProtoView } from '../view';
import { AST } from 'angular2/change_detection';
/**
 * Collects all data that is needed to process an element
 * in the compile process. Fields are filled
 * by the CompileSteps starting out with the pure HTMLElement.
 */
export declare class CompileElement {
    element: Element;
    _attrs: Map<any, any>;
    _classList: List<any>;
    textNodeBindings: Map<any, any>;
    propertyBindings: Map<any, any>;
    eventBindings: Map<any, any>;
    variableBindings: Map<any, any>;
    decoratorDirectives: List<DirectiveMetadata>;
    viewportDirective: DirectiveMetadata;
    componentDirective: DirectiveMetadata;
    _allDirectives: List<DirectiveMetadata>;
    isViewRoot: boolean;
    hasBindings: boolean;
    inheritedProtoView: ProtoView;
    inheritedProtoElementInjector: ProtoElementInjector;
    inheritedElementBinder: ElementBinder;
    distanceToParentInjector: number;
    compileChildren: boolean;
    ignoreBindings: boolean;
    constructor(element: Element);
    refreshAttrs(): void;
    attrs(): Map<string, string>;
    refreshClassList(): void;
    classList(): List<string>;
    addTextNodeBinding(indexInParent: int, expression: AST): void;
    addPropertyBinding(property: string, expression: AST): void;
    addVariableBinding(variableName: string, variableValue: string): void;
    addEventBinding(eventName: string, expression: AST): void;
    addDirective(directive: DirectiveMetadata): void;
    getAllDirectives(): List<DirectiveMetadata>;
}
