import { Label as LabelDefinition } from ".";
import { TextBase, WhiteSpace } from "../text-base";

export * from "../text-base";

export class Label extends TextBase implements LabelDefinition {
    private _android: android.widget.TextView;

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.NORMAL;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.NORMAL : WhiteSpace.NO_WRAP;
    }

    get android(): android.widget.TextView {
        return this._android;
    }

    public _createNativeView() {
        const textView = this._android = new android.widget.TextView(this._context);
        return textView;
    }
}
