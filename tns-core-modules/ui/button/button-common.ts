import {Property, PropertyMetadataSettings, PropertyChangeData} from "ui/core/dependency-observable";
import view = require("ui/core/view");
import definition = require("ui/button");
import proxy = require("ui/core/proxy");
import formattedString = require("text/formatted-string");
import observable = require("data/observable");
import * as weakEventListenerModule from "ui/core/weak-event-listener";
import {WhiteSpace} from "ui/enums";

import {isAndroid} from "platform";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
let AffectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

var weakEvents: typeof weakEventListenerModule;
function ensureWeakEvents() {
    if (!weakEvents) {
        weakEvents = require("ui/core/weak-event-listener");
    }
}

const textProperty = new Property("text", "Button", new proxy.PropertyMetadata("", AffectsLayout));
const formattedTextProperty = new Property("formattedText", "Button", new proxy.PropertyMetadata("", AffectsLayout));
const textWrapProperty = new Property("textWrap", "Button", new proxy.PropertyMetadata(false, AffectsLayout));

function onTextPropertyChanged(data: PropertyChangeData) {
    var button = <Button>data.object;

    button._onTextPropertyChanged(data);

    //RemoveThisDoubleCall
    button.style._updateTextDecoration();
    button.style._updateTextTransform();
}

function onFormattedTextPropertyChanged(data: PropertyChangeData) {
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
    public static textWrapProperty = textWrapProperty;

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.formattedText) {
            this.formattedText.updateSpansBindingContext(newValue);
        }

        //This is because of ListView virtualization
        //RemoveThisDoubleCall
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

    get whiteSpace(): string {
        return this.style.whiteSpace;
    }
    set whiteSpace(value: string) {
        this.style.whiteSpace = value;
    }

    private onFormattedTextChanged(eventData: observable.PropertyChangeData) {
        var value = <formattedString.FormattedString>eventData.value;
        this._setFormattedTextPropertyToNative(value);

        this._onPropertyChangedFromNative(Button.textProperty, value.toString());
    }

    public _onTextPropertyChanged(data: PropertyChangeData) {
        //
    }

    public _setFormattedTextPropertyToNative(value) {
        //
    }

    public _onFormattedTextPropertyChanged(data: PropertyChangeData) {
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

function onTextWrapPropertyChanged(data: PropertyChangeData) {
    var v = <view.View>data.object;
    v.style.whiteSpace = data.newValue ? WhiteSpace.normal : WhiteSpace.nowrap;
}

(<proxy.PropertyMetadata>Button.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;