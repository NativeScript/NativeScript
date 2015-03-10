import { CompileElement } from 'angular2/src/core/compiler/pipeline/compile_element';
import { CompileStep } from 'angular2/src/core/compiler/pipeline/compile_step';
import { CompileControl } from 'angular2/src/core/compiler/pipeline/compile_control';
export declare function main(): void;
export declare class IgnoreChildrenStep extends CompileStep {
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
}
