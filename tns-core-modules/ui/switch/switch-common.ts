import { Switch as SwitchDefinition } from ".";
import { View, Property, booleanConverter, CSSType } from "../core/view";
import { Color } from "../../color";

export * from "../core/view";

@CSSType("Switch")
export class SwitchBase extends View implements SwitchDefinition {
    public checked: boolean;
    public offBackgroundColor: Color;

    _onCheckedPropertyChanged(newValue: boolean) {
        //
    }
}

SwitchBase.prototype.recycleNativeView = "auto";

function onCheckedPropertyChanged(switchBase: SwitchBase, oldValue: boolean, newValue: boolean) {
    switchBase._onCheckedPropertyChanged(newValue);
}

export const checkedProperty = new Property<SwitchBase, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter, valueChanged: onCheckedPropertyChanged });
checkedProperty.register(SwitchBase);

export const offBackgroundColorProperty = new Property<SwitchBase, Color>({ name: "offBackgroundColor", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
offBackgroundColorProperty.register(SwitchBase);
