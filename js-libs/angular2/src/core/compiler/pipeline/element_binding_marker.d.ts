import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Marks elements that have bindings with a css class
 * and sets the CompileElement.hasBindings flag.
 *
 * Fills:
 * - CompileElement#hasBindings
 *
 * Reads:
 * - CompileElement#textNodeBindings
 * - CompileElement#propertyBindings
 * - CompileElement#variableBindings
 * - CompileElement#eventBindings
 * - CompileElement#decoratorDirectives
 * - CompileElement#componentDirective
 * - CompileElement#viewportDirective
 */
export declare class ElementBindingMarker extends CompileStep {
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
}
