import { Parser, AST } from 'angular2/change_detection';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Parses the property bindings on a single element.
 *
 * Fills:
 * - CompileElement#propertyBindings
 * - CompileElement#eventBindings
 * - CompileElement#variableBindings
 */
export declare class PropertyBindingParser extends CompileStep {
    _parser: Parser;
    _compilationUnit: any;
    constructor(parser: Parser, compilationUnit: any);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    _parseInterpolation(input: string): AST;
    _parseBinding(input: string): AST;
    _parseAction(input: string): AST;
}
