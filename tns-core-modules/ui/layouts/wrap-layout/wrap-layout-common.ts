import { WrapLayout as WrapLayoutDefinition, Orientation } from ".";
import { LayoutBase, Property, isIOS, Length, makeValidator, makeParser } from "../layout-base";

export * from "../layout-base";

export class WrapLayoutBase extends LayoutBase implements WrapLayoutDefinition {
    public orientation: Orientation;
    public itemWidth: Length;
    public itemHeight: Length;
    public effectiveItemWidth: number;
    public effectiveItemHeight: number;
}

WrapLayoutBase.prototype.recycleNativeView = true;

export const itemWidthProperty = new Property<WrapLayoutBase, Length>({
    name: "itemWidth", defaultValue: "auto", affectsLayout: isIOS, valueConverter: (v) => Length.parse(v),
    valueChanged: (target, oldValue, newValue) => target.effectiveItemWidth = Length.toDevicePixels(newValue, -1)
});
itemWidthProperty.register(WrapLayoutBase);

export const itemHeightProperty = new Property<WrapLayoutBase, Length>({
    name: "itemHeight", defaultValue: "auto", affectsLayout: isIOS, valueConverter: (v) => Length.parse(v),
    valueChanged: (target, oldValue, newValue) => target.effectiveItemHeight = Length.toDevicePixels(newValue, -1)
});
itemHeightProperty.register(WrapLayoutBase);

const converter = makeParser<Orientation>(makeValidator<Orientation>("horizontal", "vertical"));
export const orientationProperty = new Property<WrapLayoutBase, Orientation>({ name: "orientation", defaultValue: "horizontal", affectsLayout: isIOS, valueConverter: converter });
orientationProperty.register(WrapLayoutBase);