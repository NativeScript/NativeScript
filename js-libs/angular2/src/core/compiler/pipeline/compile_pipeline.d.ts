import { Element } from 'angular2/src/facade/dom';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
import { CompileStep } from './compile_step';
/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export declare class CompilePipeline {
    _control: CompileControl;
    constructor(steps: List<CompileStep>);
    process(rootElement: Element): List<any>;
    _process(results: any, parent: CompileElement, current: CompileElement): void;
}
