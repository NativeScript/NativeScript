import { Switch as SwitchDefinition } from ".";
import { View, Property, booleanConverter } from "../core/view";

export * from "../core/view";

export class SwitchBase extends View implements SwitchDefinition {
    public checked: boolean;
}

SwitchBase.prototype.recycleNativeView = true;

export const checkedProperty = new Property<SwitchBase, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(SwitchBase);