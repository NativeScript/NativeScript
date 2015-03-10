/**
 * A parameter annotation that creates a synchronous eager dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@Inject('aServiceToken') aService) {}
 * }
 * ```
 *
 */
export declare class Inject {
    token: any;
    constructor(token: any);
}
/**
 * A parameter annotation that creates an asynchronous eager dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@InjectPromise('aServiceToken') aServicePromise) {
 *     aServicePromise.then(aService => ...);
 *   }
 * }
 * ```
 *
 */
export declare class InjectPromise {
    token: any;
    constructor(token: any);
}
/**
 * A parameter annotation that creates a synchronous lazy dependency.
 *
 * ```
 * class AComponent {
 *   constructor(@InjectLazy('aServiceToken') aServiceFn) {
 *     aService = aServiceFn();
 *   }
 * }
 * ```
 *
 */
export declare class InjectLazy {
    token: any;
    constructor(token: any);
}
/**
 * `DependencyAnnotation` is used by the framework to extend DI.
 *
 * Only annotations implementing `DependencyAnnotation` will be added
 * to the list of dependency properties.
 *
 * For example:
 *
 * ```
 * class Parent extends DependencyAnnotation {}
 * class NotDependencyProperty {}
 *
 * class AComponent {
 *   constructor(@Parent @NotDependencyProperty aService:AService) {}
 * }
 * ```
 *
 * will create the following dependency:
 *
 * ```
 * new Dependency(Key.get(AService), [new Parent()])
 * ```
 *
 * The framework can use `new Parent()` to handle the `aService` dependency
 * in a specific way.
 *
 */
export declare class DependencyAnnotation {
    constructor();
}
