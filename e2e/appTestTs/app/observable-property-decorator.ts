/**
This file defines a decorator you can use to enable two-way
binding on view-model properties.

For example:

import { ObservableProperty } from "../observable-property-decorator";

@ObservableProperty() myProperty: boolean = true;

Read more at https://www.nativescript.org/blog/nativescript-observable-magic-string-property-name-be-gone
**/
import { Observable } from 'tns-core-modules/data/observable';

export function ObservableProperty() {
    return (target: Observable, propertyKey: string) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                return this["_" + propertyKey];
            },
            set(value) {
                if (this["_" + propertyKey] === value) {
                    return;
                }

                this["_" + propertyKey] = value;
                this.notifyPropertyChange(propertyKey, value);
            },
            enumerable: true,
            configurable: true
        });
    };
}
