import { CompileElement } from './compile_element';
import { CompileStep } from './compile_step';
/**
 * Controls the processing order of elements.
 * Right now it only allows to add a parent element.
 */
export declare class CompileControl {
    _steps: List<CompileStep>;
    _currentStepIndex: number;
    _parent: CompileElement;
    _results: any;
    _additionalChildren: any;
    constructor(steps: any);
    internalProcess(results: any, startStepIndex: any, parent: CompileElement, current: CompileElement): any;
    addParent(newElement: CompileElement): void;
    addChild(element: CompileElement): void;
}
