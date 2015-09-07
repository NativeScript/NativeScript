import common = require("ui/html-view/html-view-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

function onHtmlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <HtmlView>data.object;
    if (!view.android) {
        return;
    }

    if (types.isString(data.newValue)) {
        // If the data.newValue actually has a <a...> in it; we need to disable auto-linking
        // as it internally disables anyways; and then links won't work..
        if (data.newValue.toLowerCase().indexOf("<a ") > 0) {
            view.android.setAutoLinkMask(0);
        } else {
            view.android.setAutoLinkMask(15); // 15 (0x0f) = Linkify All text links
        }
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
        // This makes the <a href...> work
        this._android.setLinksClickable(true);
        this._android.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());

    }

}