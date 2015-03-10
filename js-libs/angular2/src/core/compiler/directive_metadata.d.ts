import { Directive } from 'angular2/src/core/annotations/annotations';

/**
 * Combination of a type with the Directive annotation
 */
export declare class DirectiveMetadata {
    type: Type;
    annotation: Directive;
    constructor(type: Type, annotation: Directive);
}
