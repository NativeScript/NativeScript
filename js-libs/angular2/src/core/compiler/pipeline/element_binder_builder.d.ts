import { Parser } from 'angular2/change_detection';
import { DirectiveMetadata } from '../directive_metadata';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Creates the ElementBinders and adds watches to the
 * ProtoChangeDetector.
 *
 * Fills:
 * - CompileElement#inheritedElementBinder
 *
 * Reads:
 * - (in parent) CompileElement#inheritedElementBinder
 * - CompileElement#hasBindings
 * - CompileElement#inheritedProtoView
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#eventBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 *
 * Note: This actually only needs the CompileElements with the flags
 * `hasBindings` and `isViewRoot`,
 * and only needs the actual HTMLElement for the ones
 * with the flag `isViewRoot`.
 */
export declare class ElementBinderBuilder extends CompileStep {
    _parser: Parser;
    _compilationUnit: any;
    constructor(parser: Parser, compilationUnit: any);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    _bindTextNodes(protoView: any, compileElement: any): void;
    _bindElementProperties(protoView: any, compileElement: any): void;
    _bindEvents(protoView: any, compileElement: any): void;
    _bindDirectiveProperties(directives: List<DirectiveMetadata>, compileElement: CompileElement): void;
}
