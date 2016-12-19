// import definition = require("ui/styling/style-property");
// import types = require("utils/types");
// import observable = require("ui/core/dependency-observable");

// var propertiesByName = {};
// var propertiesByCssName = {};
// var callbackByShorthandName = new Map<string, (value: any) => Array<definition.KeyValuePair<definition.Property, any>>>();
// var inheritableProperties: Array<Property> = [];

// function registerProperty(property: Property) {
//     if (propertiesByCssName[property.cssName]) {
//         throw new Error("Property with name " + property.cssName + " is already registered!");
//     }

//     propertiesByCssName[property.cssName] = property;
//     propertiesByName[property.name] = property;

//     if (property.inheritable) {
//         inheritableProperties.push(property);
//     }
// }

// export type StyleProperty = definition.Property;
// export type ResolvedStylePropertyHandler = (property: definition.Property | string, value: any) => void;
// export function withStyleProperty(name: string, value: any, resolvedCallback: ResolvedStylePropertyHandler): void {
//     let property = getPropertyByCssName(name);

//     if (property) {
//         // The property.valueConverter is now used to convert the value later on in DependencyObservable._setValueInternal.
//         resolvedCallback(property, value);
//     }
//     else {
//         let pairs = getShorthandPairs(name, value);
//         if (pairs) {
//             for (let j = 0; j < pairs.length; j++) {
//                 let pair = pairs[j];
//                 resolvedCallback(pair.property, pair.value);
//             }
//         } else {
//             //Fall back to the string property name as a last resort and let
//             //the callback handle it further.
//             resolvedCallback(name, value);
//         }
//     }
// }

// export function getShorthandPairs(name: string, value: any): Array<definition.KeyValuePair<definition.Property, any>> {
//     var callback = callbackByShorthandName.get(name);
//     if (callback) {
//         return callback(value)
//     }

//     return undefined;
// }

// export function registerShorthandCallback(name: string, callback: (value: any) => Array<definition.KeyValuePair<definition.Property, any>>): void {
//     if (callbackByShorthandName.has(name)) {
//         throw new Error("Shorthand callback already registered for property: " + name);
//     }

//     callbackByShorthandName.set(name, callback);
// }

// export function getPropertyByName(name: string): Property {
//     return propertiesByName[name];
// }

// export function getPropertyByCssName(name: string): Property {
//     return propertiesByCssName[name];
// }

// export function eachProperty(callback: (property: Property) => void) {
//     types.verifyCallback(callback);
//     for (let i = 0, keys = Object.keys(propertiesByName); i < keys.length; i++) {
//         let key = keys[i];
//         callback(propertiesByName[key]);
//     }
// }

// export function eachInheritableProperty(callback: (property: Property) => void) {
//     types.verifyCallback(callback);
//     for (let i = 0; i < inheritableProperties.length; i++) {
//         callback(inheritableProperties[i]);
//     }
// }

// export class Property extends observable.Property implements definition.Property {

//     constructor(name: string, public cssName: string, metadata: observable.PropertyMetadata, valueConverter?: (value: any) => any) {
//         super(name, "Style", metadata, valueConverter);

//         this.cssName = cssName;

//         registerProperty(this);
//     }
// }
