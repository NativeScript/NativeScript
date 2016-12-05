declare module "ui/core/view-base" {
    import { Observable } from "data/observable";
    import { BindingOptions } from "ui/core/bindable";
    import { Style } from "ui/styling/style";

    /**
     * Gets an ancestor from a given type.
     * @param view - Starting view (child view).
     * @param criterion - The type of ancestor view we are looking for. Could be a string containing a class name or an actual type.
     * Returns an instance of a view (if found), otherwise undefined.
     */
    export function getAncestor(view: ViewBase, criterion: string | Function): ViewBase;
    export function isEventOrGesture(name: string, view: ViewBase): boolean;

    export class ViewBase extends Observable {
        /**
         * String value used when hooking to loaded event.
         */
        public static loadedEvent: string;

        /**
         * String value used when hooking to unloaded event.
         */
        public static unloadedEvent: string;

        public ios: any;
        public android: any;
        public nativeView: any;
        public bindingContext: any;
        /**
         * Gets the parent view. This property is read-only.
         */
        public parent: ViewBase;
        /**
         * Gets the style object associated to this view.
         */
        public readonly style: Style;

        /**
         * Returns true if visibility is set to 'collapse'.
         */
        public isCollapsed: boolean;

        public bind(options: BindingOptions, source: Object): void;
        public unbind(property: string): void;

        public requestLayout(): void;
        public eachChild(callback: (child: ViewBase) => boolean): void;
    }
}

declare module "ui/core/properties" {
    import { ViewBase } from "ui/core/view-base";
    import { Style } from "ui/styling/style";

    interface PropertyOptions<T, U> {
        readonly name: string,
        readonly defaultValue?: U,
        readonly affectsLayout?: boolean,
        readonly equalityComparer?: (x: U, y: U) => boolean,
        readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void,
        readonly valueConverter?: (value: any) => U
    }

    export interface CoerciblePropertyOptions<T, U> extends PropertyOptions<T, U> {
        coerceValue(T, U): U
    }

    interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
        readonly cssName: string;
    }

    class Property<T extends ViewBase, U> implements TypedPropertyDescriptor<U> {
        constructor(options: PropertyOptions<T, U>);

        public readonly native: symbol;
        public register(cls: { prototype: T }): void;
    }

    class CoercibleProperty<T extends ViewBase, U> implements TypedPropertyDescriptor<U> {
        constructor(options: CoerciblePropertyOptions<T, U>);

        public readonly native: symbol;
        public readonly coerce: (target: T) => void;
        public register(cls: { prototype: T }): void;
    }

    class InheritedProperty<T extends ViewBase, U> extends Property<T, U> {
        constructor(options: PropertyOptions<T, U>);
    }

    class CssProperty<T extends Style, U> {
        constructor(options: CssPropertyOptions<T, U>);

        public readonly native: symbol;
        public readonly name: string;
        public readonly cssName: string;
        public register(cls: { prototype: T }): void;
    }

    class InheritedCssProperty<T extends Style, U> extends CssProperty<T, U> {
        constructor(options: CssPropertyOptions<T, U>);
    }

    export interface ShorthandPropertyOptions {
        readonly name: string,
        readonly cssName: string;
        readonly converter: (value: string) => [CssProperty<any, any>, any][],
        readonly getter: (this: Style) => string
    }

    export class ShorthandProperty<T extends Style> {
        constructor(options: ShorthandPropertyOptions);

        public readonly native: symbol;
        public readonly name: string;
        public readonly cssName: string;
        public register(cls: { prototype: T }): void;
    }
}