import { HtmlView as HtmlViewDefinition } from "ui/html-view";
import { View, Property } from "ui/core/view";

export * from "ui/core/view";

export class HtmlViewBase extends View implements HtmlViewDefinition {
    public html: string;
}

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlViewBase, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlViewBase);