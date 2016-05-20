import common = require("./label-common");
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
