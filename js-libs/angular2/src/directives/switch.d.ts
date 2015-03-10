import { ViewContainer } from 'angular2/src/core/compiler/view_container';
import { NgElement } from 'angular2/src/core/dom/element';
/**
 * The `Switch` directive is used to conditionally swap DOM structure on your template based on a
 * scope expression.
 * Elements within `Switch` but without `SwitchWhen` or `SwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `Switch` simply chooses nested elements and makes them visible based on which element matches
 * the value obtained from the evaluated expression. In other words, you define a container element
 * (where you place the directive), place an expression on the **`[switch]="..."` attribute**),
 * define any inner elements inside of the directive and place a `[switch-when]` attribute per
 * element.
 * The when attribute is used to inform Switch which element to display when the expression is
 * evaluated. If a matching expression is not found via a when attribute then an element with the
 * default attribute is displayed.
 *
 * Example:
 *
 * ```
 * <ANY [switch]="expression">
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-when]="whenExpression1">...</template>
 *   <template [switch-default]>...</template>
 * </ANY>
 * ```
 */
export declare class Switch {
    _switchValue: any;
    _useDefault: boolean;
    _valueViewContainers: Map<any, any>;
    _activeViewContainers: List<ViewContainer>;
    constructor();
    value: any;
    _onWhenValueChanged(oldWhen: any, newWhen: any, viewContainer: ViewContainer): void;
    _emptyAllActiveViewContainers(): void;
    _activateViewContainers(containers: List<ViewContainer>): void;
    _registerViewContainer(value: any, container: ViewContainer): void;
    _deregisterViewContainer(value: any, container: ViewContainer): void;
}
/**
 * Defines a case statement as an expression.
 *
 * If multiple `SwitchWhen` match the `Switch` value, all of them are displayed.
 *
 * Example:
 *
 * ```
 * // match against a context variable
 * <template [switch-when]="contextVariable">...</template>
 *
 * // match against a constant string
 * <template [switch-when]="'stringValue'">...</template>
 * ```
 */
export declare class SwitchWhen {
    _value: any;
    _switch: Switch;
    _viewContainer: ViewContainer;
    constructor(el: NgElement, viewContainer: ViewContainer, sswitch: Switch);
    when: any;
}
/**
 * Defines a default case statement.
 *
 * Default case statements are displayed when no `SwitchWhen` match the `switch` value.
 *
 * Example:
 *
 * ```
 * <template [switch-default]>...</template>
 * ```
 */
export declare class SwitchDefault {
    constructor(viewContainer: ViewContainer, sswitch: Switch);
}
