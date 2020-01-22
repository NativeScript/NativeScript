import { Color } from "../../color";
import { Style, CssProperty } from "../core/properties";
import { View, Property, CSSType } from "../core/view";
import { HtmlView as HtmlViewDefinition } from ".";

export * from "../core/view";

@CSSType("HtmlView")
export class HtmlViewBase extends View implements HtmlViewDefinition {
    public html: string;
}

HtmlViewBase.prototype.recycleNativeView = "auto";

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlViewBase);

export const linkColorProperty = new CssProperty<Style, Color>({
    name: "linkColor",
    cssName: "link-color",
    equalityComparer: Color.equals,
    valueConverter: (value) => new Color(value),
});
linkColorProperty.register(Style);
