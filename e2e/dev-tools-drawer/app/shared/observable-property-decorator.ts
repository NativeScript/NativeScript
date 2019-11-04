import { Observable } from "tns-core-modules/data/observable";

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
