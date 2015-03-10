import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * One part of the compile process.
 * Is guaranteed to be called in depth first order
 */
export declare class CompileStep {
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
}
