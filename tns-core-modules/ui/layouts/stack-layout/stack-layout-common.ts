import { StackLayout as StackLayoutDefinition, Orientation } from ".";
import { LayoutBase, Property, isIOS, makeValidator, makeParser, CSSType } from "../layout-base";

export * from "../layout-base";

@CSSType("StackLayout")
export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
    public orientation: Orientation;
}

StackLayoutBase.prototype.recycleNativeView = "auto";

const converter = makeParser<Orientation>(makeValidator("horizontal", "vertical"));

export const orientationProperty = new Property<StackLayoutBase, Orientation>({ name: "orientation", defaultValue: "vertical", affectsLayout: isIOS, valueConverter: converter });
orientationProperty.register(StackLayoutBase);