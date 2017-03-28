import { HtmlView as HtmlViewDefinition } from ".";
import { View, Property } from "../core/view";

export * from "../core/view";

export class HtmlViewBase extends View implements HtmlViewDefinition {
    public html: string;
}

HtmlViewBase.prototype.recycleNativeView = true;

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlViewBase);