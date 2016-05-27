import view = require("ui/core/view");

export type PropertySetter = (instance: view.View, propertyValue: any) => void;

var specialProperties: Map<string, PropertySetter> = new Map<string, PropertySetter>();

function specialPropertyKey(name: string) {
    return name.toLowerCase();
}

export function registerSpecialProperty(name: string, setter: PropertySetter): void {
    let propertyKey = specialPropertyKey(name);
    if (specialProperties.has(propertyKey)) {
        throw new Error(`Property for ${propertyKey} already registered`);
    } else {
        specialProperties.set(propertyKey, setter);
    }
}

export function getSpecialPropertySetter(name: string): PropertySetter {
    let propertyKey = specialPropertyKey(name);
    return specialProperties.get(propertyKey);
}
