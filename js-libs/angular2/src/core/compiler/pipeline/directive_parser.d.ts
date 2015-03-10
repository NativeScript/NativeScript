import { SelectorMatcher } from '../selector';
import { DirectiveMetadata } from '../directive_metadata';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 *
 * Fills:
 * - CompileElement#decoratorDirectives
 * - CompileElement#templateDirecitve
 * - CompileElement#componentDirective.
 *
 * Reads:
 * - CompileElement#propertyBindings (to find directives contained
 *   in the property bindings)
 * - CompileElement#variableBindings (to find directives contained
 *   in the variable bindings)
 */
export declare class DirectiveParser extends CompileStep {
    _selectorMatcher: SelectorMatcher;
    constructor(directives: List<DirectiveMetadata>);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
}
