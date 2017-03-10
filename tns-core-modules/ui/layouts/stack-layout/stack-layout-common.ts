import { StackLayout as StackLayoutDefinition } from ".";
import { LayoutBase, Property, isIOS } from "../layout-base";

export * from "../layout-base";

export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
    public orientation: "horizontal" | "vertical";
}

export const orientationProperty = new Property<StackLayoutBase, "horizontal" | "vertical">({
    name: "orientation", defaultValue: "vertical", affectsLayout: isIOS,
    valueConverter: (v) => {
        if (v === "horizontal" || v === "vertical") {
            return <"horizontal" | "vertical">v;
        }

        throw new Error(`Invalid orientation value: ${v}`);
    }
});
orientationProperty.register(StackLayoutBase);
