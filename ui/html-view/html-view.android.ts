import common = require("./html-view-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

function onHtmlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <HtmlView>data.object;
    if (!view.android) {
        return;
    }

    if (types.isString(data.newValue)) {
        // If the data.newValue actually has a <a...> in it; we need to disable autolink mask
        // it internally disables the coloring, but then the <a> links won't work..  So to support both
        // styles of links (html and just text based) we have to manually enable/disable the autolink mask
        var mask = 15;
        if (data.newValue.search(/<a\s/i) >= 0) {
            mask = 0;
        }
        view.android.setAutoLinkMask(mask);
        view.android.setText(<any>android.text.Html.fromHtml(data.newValue));
    } else {
        view.android.setText("");
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.HtmlView.htmlProperty.metadata).onSetNativeValue = onHtmlPropertyChanged;

global.moduleMerge(common, exports);

export class HtmlView extends common.HtmlView {
    private _android: android.widget.TextView;

    get android(): android.widget.TextView {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.TextView(this._context);
        // This makes the html <a href...> vwork
        this._android.setLinksClickable(true);
        this._android.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());

    }

}
