import { Label as LabelDefinition } from "ui/label";
import { TextBase } from "ui/text-base";

export * from "ui/text-base";

export class Label extends TextBase implements LabelDefinition {
    private _android: android.widget.TextView;

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? "normal" : "nowrap";
    }

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