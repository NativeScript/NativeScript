import { Parser } from 'angular2/change_detection';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Parses interpolations in direct text child nodes of the current element.
 *
 * Fills:
 * - CompileElement#textNodeBindings
 */
export declare class TextInterpolationParser extends CompileStep {
    _parser: Parser;
    _compilationUnit: any;
    constructor(parser: Parser, compilationUnit: any);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    _parseTextNode(pipelineElement: any, node: any, nodeIndex: any): void;
}
