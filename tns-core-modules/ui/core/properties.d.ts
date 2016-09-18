// declare module "ui/core/properties" {
//     import {ViewBase} from "ui/coew/viewbase";
//     import {Style} from "ui/styling/style";

//     interface PropertyOptions<T, U> {
//         name: string,
//         defaultValue?: U,
//         affectsLayout?: boolean,
//         equalityComparer?: (x: U, y: U) => boolean,
//         valueChanged?: (target: T, oldValue: U, newValue: U) => void,
//         valueConverter?: (value: any) => U
//     }

//     interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
//         cssName: string;
//     }

//     class Property<T extends ViewBase, U> implements PropertyDescriptor {
//         constructor(options: PropertyOptions<T, U>);

//         public native: symbol;
//         public register(cls: { prototype: T }): void;
//     }

//     class InheritedProperty<T extends ViewBase, U> extends Property<T, U> {
//         constructor(options: PropertyOptions<T, U>);
//     }

//     class CssProperty<T extends Style, U> {
//         constructor(options: CssPropertyOptions<T, U>);

//         public native: symbol;
//         public cssName: string;
//         public register(cls: { prototype: T }): void;
//     }

//     class InheritedCssProperty<T extends Style, U> extends CssProperty<T, U> {
//         constructor(options: CssPropertyOptions<T, U>);
//     }
// }