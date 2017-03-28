import { Label as LabelDefinition } from ".";
import { TextBase, WhiteSpace } from "../text-base";

export * from "../text-base";

export class Label extends TextBase implements LabelDefinition {
    nativeView: android.widget.TextView;

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.NORMAL;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.NORMAL : WhiteSpace.NO_WRAP;
    }

    public createNativeView() {
        const textView = new android.widget.TextView(this._context);
        textView.setSingleLine(true);
        textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
        return textView;
    }

    public initNativeView(): void {
        super.initNativeView();
        const textView = this.nativeView;
        textView.setSingleLine(true);
        textView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    }
}

// Label.prototype.recycleNativeView = true;