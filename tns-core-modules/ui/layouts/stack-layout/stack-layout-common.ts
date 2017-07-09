import { StackLayout as StackLayoutDefinition, Orientation } from ".";
import { LayoutBase, Property, isIOS, makeValidator, makeParser } from "../layout-base";

export * from "../layout-base";

export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
    public orientation: Orientation;
}

StackLayoutBase.prototype.recycleNativeView = true;

const converter = makeParser<Orientation>(makeValidator("horizontal", "vertical"));

export const orientationProperty = new Property<StackLayoutBase, Orientation>({ name: "orientation", defaultValue: "vertical", affectsLayout: isIOS, valueConverter: converter });
orientationProperty.register(StackLayoutBase);