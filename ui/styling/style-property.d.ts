declare module "ui/styling/style-property" {
    import definition = require("ui/styling");
    import observable = require("ui/core/dependency-observable");

    export function getPropertyByName(name: string): Property;

    export function getPropertyByCssName(name: string): Property;

    export function eachProperty(callback: (property: Property) => void);

    export function eachInheritableProperty(callback: (property: Property) => void);

    export class Property extends observable.Property implements definition.Property {

        constructor(name: string, cssName: string, metadata: observable.PropertyMetadata, valueConverter?: (value: any) => any);

        cssName: string;
    }
}