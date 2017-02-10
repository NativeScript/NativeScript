import { StackLayout as StackLayoutDefinition } from "ui/layouts/stack-layout";
import { LayoutBase, Property, isIOS } from "ui/layouts/layout-base";

export * from "ui/layouts/layout-base";

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