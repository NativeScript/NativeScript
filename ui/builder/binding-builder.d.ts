//@private
declare module "ui/builder/binding-builder" {
    export module bindingConstants {
        export var sourceProperty: string;
        export var targetProperty: string;
        export var expression: string;
        export var twoWay: string;
        export var source: string;
        export var bindingValueKey: string;
        export var parentValueKey: string;
        export var parentsValueKey: string;
        export var newPropertyValueKey: string;
    }

    export function getBindingOptions(name: string, value: string): any;

    export var parentsRegex: RegExp;
}
