import definition = require("ui/label");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import textBase = require("ui/text-base");
import view = require("ui/core/view");
import * as enumsModule from "ui/enums";

var enums: typeof enumsModule;
function ensureEnums() {
    if (!enums) {
        enums = require("ui/enums");
    }
}

export class Label extends textBase.TextBase implements definition.Label {
    public static textWrapProperty = new dependencyObservable.Property(
        "textWrap",
        "Label",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    get textWrap(): boolean {
        return this._getValue(Label.textWrapProperty);
    }
    set textWrap(value: boolean) {
        this._setValue(Label.textWrapProperty, value);
    }
}

function onTextWrapPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var v = <view.View>data.object;
    ensureEnums();

    v.style.whiteSpace = data.newValue ? enums.WhiteSpace.normal : enums.WhiteSpace.nowrap;
}

(<proxy.PropertyMetadata>Label.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;