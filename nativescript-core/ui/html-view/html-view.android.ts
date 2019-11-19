import {
    HtmlViewBase, htmlProperty
} from "./html-view-common";

export * from "./html-view-common";

export class HtmlView extends HtmlViewBase {
    nativeViewProtected: android.widget.TextView;

    public createNativeView() {
        return new android.widget.TextView(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;

        // This makes the html <a href...> work
        nativeView.setLinksClickable(true);
        nativeView.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
    }

    public resetNativeView(): void {
        super.resetNativeView();
        this.nativeViewProtected.setAutoLinkMask(0);
    }

    [htmlProperty.getDefault](): string {
        return "";
    }
    [htmlProperty.setNative](value: string) {
        // If the data.newValue actually has a <a...> in it; we need to disable autolink mask
        // it internally disables the coloring, but then the <a> links won't work..  So to support both
        // styles of links (html and just text based) we have to manually enable/disable the autolink mask
        let mask = 15;
        if (value.search(/<a\s/i) >= 0) {
            mask = 0;
        }
        this.nativeViewProtected.setAutoLinkMask(mask);
        this.nativeViewProtected.setText(<any>android.text.Html.fromHtml(value));
    }
}
