import { DependencyAnnotation } from 'angular2/di';
/**
 * The directive can only be injected from the current element
 * or from its parent.
 */
export declare class Parent extends DependencyAnnotation {
    constructor();
}
/**
 * The directive can only be injected from the current element
 * or from its ancestor.
 */
export declare class Ancestor extends DependencyAnnotation {
    constructor();
}
