/**
 * @module "ui/core/bindable"
 */ /** */

import { ViewBase } from "../view-base";
import { Observable, WrappedValue, PropertyChangeData, EventData } from "../../../data/observable";
import {
    isEnabled as traceEnabled,
    write as traceWrite,
    error as traceError,
    categories as traceCategories,
    notifyEvent as traceNotifyEvent,
    messageType as traceMessageType,
    isCategorySet
} from "../../../trace";

export {
    Observable, WrappedValue, PropertyChangeData, EventData,
    traceEnabled, traceWrite, traceError, traceCategories, traceNotifyEvent,
    traceMessageType, isCategorySet
};

/**
 * The options object used in the Bindable.bind method.
 */
export interface BindingOptions {
    /**
     * The property name of the source object (typically the ViewModel) to bind to.
     */
    sourceProperty: string;
    /**
     * The property name of the target object (that is the Bindable instance) to bind the source property to.
     */
    targetProperty: string;
    /**
     * True to establish a two-way binding, false otherwise. A two-way binding will synchronize both the source and the target property values regardless of which one initiated the change.
     */
    twoWay?: boolean;
    /**
     * An expression used for calculations (convertions) based on the value of the property.
     */
    expression?: string;
}

/**
 * An interface which defines methods need to create binding value converter.
 */
export interface ValueConverter {
    /**
     * A method that will be executed when a value (of the binding property) should be converted to the observable model.
     * For example: user types in a text field, but our business logic requires to store data in a different manner (e.g. in lower case).
     * @param params - An array of parameters where first element is the value of the property and next elements are parameters send to converter.
     */
    toModel: (...params: any[]) => any;
    /**
     * A method that will be executed when a value should be converted to the UI view. For example we have a date object which should be displayed to the end user in a specific date format.
     * @param params - An array of parameters where first element is the value of the property and next elements are parameters send to converter.
     */
    toView: (...params: any[]) => any;
}

export class Binding {
    constructor(target: ViewBase, options: BindingOptions);
    public bind(source: Object): void;
    public unbind();
    public sourceIsBindingContext: boolean;
    public updateTwoWay(value: any);
}

export function getEventOrGestureName(name: string): string;
export function isEventOrGesture(name: string, view: ViewBase): boolean;
