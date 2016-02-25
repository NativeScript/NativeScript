import common = require("./text-base-common");
import types = require("utils/types");
import dependencyObservable = require("ui/core/dependency-observable");

export class TextBase extends common.TextBase {
    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue = types.isNullOrUndefined(data.newValue) ? "" : data.newValue + "";
        this.ios.text = newValue;
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
    }

    public _setFormattedTextPropertyToNative(value) {
        this.ios.attributedText = value._formattedText;
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
        this.requestLayout();
    }

    public _onStylePropertyChanged(property: dependencyObservable.Property): void {
        if (this.formattedText) {
            // Re-apply the formatted text to override style changes if needed.
            // https://github.com/NativeScript/NativeScript/issues/1078
            this._setFormattedTextPropertyToNative(this.formattedText);
        }
    }
}