import { Switch as SwitchDefinition } from ".";
import { View, Property, booleanConverter, CSSType } from "../core/view";

export * from "../core/view";

@CSSType("Switch")
export class SwitchBase extends View implements SwitchDefinition {
    public checked: boolean;
}

SwitchBase.prototype.recycleNativeView = "auto";

export const checkedProperty = new Property<SwitchBase, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(SwitchBase);