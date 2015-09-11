declare module "ui/builder/special-properties" {
    import view = require("ui/core/view");

    export type PropertySetter = (instance: view.View, propertyValue: string) => void;
    export function registerSpecialProperty(name: string, setter: PropertySetter): void;
    export function getSpecialPropertySetter(name: string): PropertySetter;
}
