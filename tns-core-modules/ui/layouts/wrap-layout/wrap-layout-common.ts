import { WrapLayout as WrapLayoutDefinition } from "ui/layouts/wrap-layout";
import { LayoutBase, Property, isIOS, Length, zeroLength } from "ui/layouts/layout-base";

export * from "ui/layouts/layout-base";

export class WrapLayoutBase extends LayoutBase implements WrapLayoutDefinition {
    public orientation: "horizontal" | "vertical";
    public itemWidth: Length;
    public itemHeight: Length;
    public effectiveItemWidth: number;
    public effectiveItemHeight: number;
}

export const itemWidthProperty = new Property<WrapLayoutBase, Length>({
    name: "itemWidth", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: (v) => Length.parse(v),
    valueChanged: (target, oldValue, newValue) => target.effectiveItemWidth = Length.toDevicePixels(newValue, -1)
});
itemWidthProperty.register(WrapLayoutBase);

export const itemHeightProperty = new Property<WrapLayoutBase, Length>({
    name: "itemHeight", defaultValue: zeroLength, affectsLayout: isIOS, valueConverter: (v) => Length.parse(v),
    valueChanged: (target, oldValue, newValue) => target.effectiveItemHeight = Length.toDevicePixels(newValue, -1)
});
itemHeightProperty.register(WrapLayoutBase);

export const orientationProperty = new Property<WrapLayoutBase, "horizontal" | "vertical">({
    name: "orientation", defaultValue: "horizontal", affectsLayout: isIOS,
    valueConverter: (v) => {
        if (v === "horizontal" || v === "vertical") {
            return <"horizontal" | "vertical">v;
        }

        throw new Error(`Invalid orientation value: ${v}`);
    }
});
orientationProperty.register(WrapLayoutBase);