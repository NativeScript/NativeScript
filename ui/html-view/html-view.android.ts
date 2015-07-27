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
    }
}