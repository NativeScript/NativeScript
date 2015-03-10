import { ProtoElementInjector, DirectiveBinding } from '../element_injector';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
import { DirectiveMetadata } from '../directive_metadata';
/**
 * Creates the ProtoElementInjectors.
 *
 * Fills:
 * - CompileElement#inheritedProtoElementInjector
 * - CompileElement#distanceToParentInjector
 *
 * Reads:
 * - (in parent) CompileElement#inheritedProtoElementInjector
 * - (in parent) CompileElement#distanceToParentInjector
 * - CompileElement#isViewRoot
 * - CompileElement#inheritedProtoView
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 */
export declare class ProtoElementInjectorBuilder extends CompileStep {
    internalCreateProtoElementInjector(parent: any, index: any, directives: any, firstBindingIsComponent: any, distance: any): ProtoElementInjector;
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    _getDistanceToParentInjector(parent: any, current: any): any;
    _getParentProtoElementInjector(parent: any, current: any): any;
    _createBinding(d: DirectiveMetadata): DirectiveBinding;
}
