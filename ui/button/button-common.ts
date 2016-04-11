import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import definition = require("ui/button");
import proxy = require("ui/core/proxy");
import formattedString = require("text/formatted-string");
import observable = require("data/observable");
import * as weakEventListenerModule from "ui/core/weak-event-listener";
import * as enumsModule from "ui/enums";

var weakEvents: typeof weakEventListenerModule;
function ensureWeakEvents() {
    if (!weakEvents) {
        weakEvents = require("ui/core/weak-event-listener");
    }
}

var enums: typeof enumsModule;
function ensureEnums() {
    if (!enums) {
        enums = require("ui/enums");
    }
}

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

    button.style._updateTextDecoration();
    button.style._updateTextTransform();

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

        this.style._updateTextDecoration();
        this.style._updateTextTransform();
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
            ensureWeakEvents();

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
        var value = <formattedString.FormattedString>eventData.value;
        this._setFormattedTextPropertyToNative(value);

        this._onPropertyChangedFromNative(Button.textProperty, value.toString());
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }

    public _setFormattedTextPropertyToNative(value) {
        //
    }

    public _onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue = <formattedString.FormattedString>data.newValue;
        if (newValue) {
            newValue.parent = this;
        }
        this._setFormattedTextPropertyToNative(newValue);

        var newText = newValue ? newValue.toString() : "";
        this._onPropertyChangedFromNative(Button.textProperty, newText);
    }

    public _addChildFromBuilder(name: string, value: any): void {
        formattedString.FormattedString.addFormattedStringToView(this, name, value);
    }
}

function onTextWrapPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var v = <view.View>data.object;
    ensureEnums();

    v.style.whiteSpace = data.newValue ? enums.WhiteSpace.normal : enums.WhiteSpace.nowrap;
}

(<proxy.PropertyMetadata>Button.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;