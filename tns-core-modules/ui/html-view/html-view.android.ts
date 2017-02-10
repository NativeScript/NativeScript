import {
    HtmlViewBase, htmlProperty
} from "./html-view-common";

export * from "./html-view-common";

export class HtmlView extends HtmlViewBase {
    private _android: android.widget.TextView;

    get android(): android.widget.TextView {
        return this._android;
    }

    public _createNativeView() {
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