import common = require("./text-base-common");
import types = require("utils/types");
import dependencyObservable = require("ui/core/dependency-observable");

export class TextBase extends common.TextBase {
    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue = types.toUIString(data.newValue);
        this.ios.text = newValue;
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
        this._requestLayoutOnTextChanged();
    }

    public _setFormattedTextPropertyToNative(value) {
        var newText = value ? value._formattedText : null;
        this.ios.attributedText = newText;
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
        this.requestLayout();
    }

    private _settingFormattedTextPropertyToNative = false;
    public _onStylePropertyChanged(property: dependencyObservable.Property): void {
        if (this._settingFormattedTextPropertyToNative) {
            // Guard against stack-overflow.
            return;
        }

        if (this.formattedText) {
            // Re-apply the formatted text to override style changes if needed.
            // https://github.com/NativeScript/NativeScript/issues/1078
            this._settingFormattedTextPropertyToNative = true;
            this._setFormattedTextPropertyToNative(this.formattedText);
            this._settingFormattedTextPropertyToNative = false;
        }
    }
}