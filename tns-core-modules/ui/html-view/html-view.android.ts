import { HtmlView as HtmlViewDefinition } from "ui/html-view";
import { Property } from "ui/core/properties";
import { View } from "ui/core/view";

export * from "ui/core/view";

export class HtmlView extends View implements HtmlViewDefinition {
    private _android: android.widget.TextView;

    get android(): android.widget.TextView {
        return this._android;
    }

    public html: string;

    public _createUI() {
        this._android = new android.widget.TextView(this._context);
        // This makes the html <a href...> work
        this._android.setLinksClickable(true);
        this._android.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
    }

    get [htmlProperty.native](): string {
        return "";
    }
    set [htmlProperty.native](value: string) {
        // If the data.newValue actually has a <a...> in it; we need to disable autolink mask
        // it internally disables the coloring, but then the <a> links won't work..  So to support both
        // styles of links (html and just text based) we have to manually enable/disable the autolink mask
        let mask = 15;
        if (value.search(/<a\s/i) >= 0) {
            mask = 0;
        }
        this._android.setAutoLinkMask(mask);
        this._android.setText(<any>android.text.Html.fromHtml(value));
    }
}

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlView, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlView);