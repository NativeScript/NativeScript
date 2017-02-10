import { Switch as SwitchDefinition } from "ui/switch";
import { View, Property, booleanConverter } from "ui/core/view";

export * from "ui/core/view";

export class SwitchBase extends View implements SwitchDefinition {
    public checked: boolean;
}

export const checkedProperty = new Property<SwitchBase, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(SwitchBase);
