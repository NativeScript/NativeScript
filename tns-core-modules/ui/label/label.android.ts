import { Label as LabelDefinition } from ".";
import { TextBase, WhiteSpace, whiteSpaceProperty } from "../text-base";

export * from "../text-base";

export class Label extends TextBase implements LabelDefinition {
    nativeView: android.widget.TextView;

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? "normal" : "nowrap";
    }

    public createNativeView() {
        return new android.widget.TextView(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const textView = this.nativeView;
        textView.setSingleLine(true);
        textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    }

    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        // Label initial value is no-wrap. set in initNativeView
        const newValue = value === "initial" ? "nowrap" : value;
        super[whiteSpaceProperty.setNative](newValue);
    }
}

// Label.prototype.recycleNativeView = true;