import { Switch as SwitchDefinition } from ".";
import { View, CSSType } from "../core/view";
import { Property } from "../core/properties";
import { booleanConverter } from "../core/view-base";

@CSSType("Switch")
export class SwitchBase extends View implements SwitchDefinition {
    public checked: boolean;
}

SwitchBase.prototype.recycleNativeView = "auto";

export const checkedProperty = new Property<SwitchBase, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(SwitchBase);