import { HtmlView as HtmlViewDefinition } from ".";
import { View, CSSType } from "../core/view";
import { Property } from "../core/properties";

@CSSType("HtmlView")
export class HtmlViewBase extends View implements HtmlViewDefinition {
    public html: string;
}

HtmlViewBase.prototype.recycleNativeView = "auto";

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlViewBase);