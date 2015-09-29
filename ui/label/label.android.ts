import common = require("./label-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onTextWrapPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var label = <Label>data.object;
    if (!label.android) {
        return;
    }

    if (data.newValue) {
        label.android.setSingleLine(false);
        label.android.setEllipsize(null);
    }
    else {
        label.android.setSingleLine(true);
        label.android.setEllipsize(android.text.TextUtils.TruncateAt.END);
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.Label.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;

global.moduleMerge(common, exports);

export class Label extends common.Label {
    private _android: android.widget.TextView;

    get android(): android.widget.TextView {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.TextView(this._context);

        // By default, the Android TextView will word-wrap and grow vertically. 
        // Make it conform to the default value of our textWrap property which is false.
        // TODO: Think of a more uniform approach of configuring native controls when creating them.
        this._android.setSingleLine(true);
        this._android.setEllipsize(android.text.TextUtils.TruncateAt.END);
    }
}
