import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import definition = require("ui/button");
import proxy = require("ui/core/proxy");
import formattedString = require("text/formatted-string");
import observable = require("data/observable");
import weakEvents = require("ui/core/weak-event-listener");
import enums = require("ui/enums");

var textProperty = new dependencyObservable.Property(
    "text",
    "Button",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

var formattedTextProperty = new dependencyObservable.Property(
    "formattedText",
    "Button",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var button = <Button>data.object;
    button._onTextPropertyChanged(data);
}

function onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var button = <Button>data.object;
    button._onFormattedTextPropertyChanged(data);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>textProperty.metadata).onSetNativeValue = onTextPropertyChanged;
(<proxy.PropertyMetadata>formattedTextProperty.metadata).onSetNativeValue = onFormattedTextPropertyChanged;

export class Button extends view.View implements definition.Button {
    public static tapEvent = "tap";
    public static textProperty = textProperty;
    public static formattedTextProperty = formattedTextProperty;

    public static textWrapProperty = new dependencyObservable.Property(
        "textWrap",
        "Button",
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.formattedText) {
            this.formattedText.updateSpansBindingContext(newValue);
        }
    }

    get text(): string {
        return this._getValue(Button.textProperty);
    }

    set text(value: string) {
        this._setValue(Button.textProperty, value);
    }

    get formattedText(): formattedString.FormattedString {
        return this._getValue(Button.formattedTextProperty);
    }

    set formattedText(value: formattedString.FormattedString) {
        if (this.formattedText !== value) {
            if (this.formattedText) {
                weakEvents.removeWeakEventListener(this.formattedText, observable.Observable.propertyChangeEvent, this.onFormattedTextChanged, this);
            }
            this._setValue(Button.formattedTextProperty, value);
            if (value) {
                weakEvents.addWeakEventListener(value, observable.Observable.propertyChangeEvent, this.onFormattedTextChanged, this);
            }
        }
    }

    get textWrap(): boolean {
        return this._getValue(Button.textWrapProperty);
    }
    set textWrap(value: boolean) {
        this._setValue(Button.textWrapProperty, value);
    }

    private onFormattedTextChanged(eventData: observable.PropertyChangeData) {
        this.setFormattedTextPropertyToNative(eventData.value);
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.android) {
            this.android.setText(data.newValue + "");
        }
        if (this.ios) {
            // In general, if a property is not specified for a state, the default is to use 
            // the UIControlStateNormal value. If the value for UIControlStateNormal is not set, 
            // then the property defaults to a system value. Therefore, at a minimum, you should 
            // set the value for the normal state.
            this.ios.setTitleForState(data.newValue + "", UIControlState.UIControlStateNormal);
        }
    }

    private setFormattedTextPropertyToNative(value) {
        if (this.android) {
            this.android.setText(value._formattedText);
        }
        if (this.ios) {
            // In general, if a property is not specified for a state, the default is to use 
            // the UIControlStateNormal value. If the value for UIControlStateNormal is not set, 
            // then the property defaults to a system value. Therefore, at a minimum, you should 
            // set the value for the normal state.
            this.ios.setAttributedTitleForState(value._formattedText, UIControlState.UIControlStateNormal);
        }
    }

    public _onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (data.newValue) {
            (<formattedString.FormattedString>data.newValue).parent = this;
        }
        this.setFormattedTextPropertyToNative(data.newValue);
    }

    public _addChildFromBuilder(name: string, value: any): void {
        formattedString.FormattedString.addFormattedStringToView(this, name, value);
    }
}

function onTextWrapPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var v = <view.View>data.object;
    v.style.whiteSpace = data.newValue ? enums.WhiteSpace.normal : enums.WhiteSpace.nowrap;
}

(<proxy.PropertyMetadata>Button.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;