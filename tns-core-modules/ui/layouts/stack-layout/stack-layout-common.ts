import { StackLayout as StackLayoutDefinition, Orientation } from ".";
import { LayoutBase } from "../layout-base";
import { makeParser, makeValidator, Property } from "../../core/properties";
import { isIOS } from "../../../platform";
import { CSSType } from '../../core/view/view';

// export * from "../layout-base";

@CSSType("StackLayout")
export class StackLayoutBase extends LayoutBase implements StackLayoutDefinition {
    public orientation: Orientation;
}

StackLayoutBase.prototype.recycleNativeView = "auto";

const converter = makeParser<Orientation>(makeValidator("horizontal", "vertical"));

export const orientationProperty = new Property<StackLayoutBase, Orientation>({ name: "orientation", defaultValue: "vertical", affectsLayout: isIOS, valueConverter: converter });
orientationProperty.register(StackLayoutBase);