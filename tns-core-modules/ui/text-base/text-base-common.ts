import definition = require("ui/text-base");
import view = require("ui/core/view");
import observable = require("data/observable");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import formattedString = require("text/formatted-string");
import * as weakEventListenerModule from "ui/core/weak-event-listener";
import tbs = require("ui/text-base/text-base-styler");

var weakEvents: typeof weakEventListenerModule;
function ensureWeakEvents() {
    if (!weakEvents) {
        weakEvents = require("ui/core/weak-event-listener");
    }
}

var textProperty = new dependencyObservable.Property(
    "text",
    "TextBase",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.None)
);

var formattedTextProperty = new dependencyObservable.Property(
    "formattedText",
    "TextBase",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
);

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textBase = <TextBase>data.object;

    textBase._onTextPropertyChanged(data);

    textBase.style._updateTextTransform();
    textBase.style._updateTextDecoration();
}

(<proxy.PropertyMetadata>textProperty.metadata).onSetNativeValue = onTextPropertyChanged;

function onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textBase = <TextBase>data.object;
    textBase._onFormattedTextPropertyChanged(data);
}

(<proxy.PropertyMetadata>formattedTextProperty.metadata).onSetNativeValue = onFormattedTextPropertyChanged;

export class TextBase extends view.View implements definition.TextBase, formattedString.FormattedStringView {
    public static textProperty = textProperty;
    public static formattedTextProperty = formattedTextProperty;

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.formattedText) {
            this.formattedText.updateSpansBindingContext(newValue);
        }

        this.style._updateTextTransform();
        this.style._updateTextDecoration();
    }

    get text(): string {
        return this._getValue(TextBase.textProperty);
    }

    set text(value: string) {
        this._setValue(TextBase.textProperty, value);
    }

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    get textAlignment(): string {
        return this.style.textAlignment;
    }
    set textAlignment(value: string) {
        this.style.textAlignment = value;
    }

    get formattedText(): formattedString.FormattedString {
        return this._getValue(TextBase.formattedTextProperty);
    }

    set formattedText(value: formattedString.FormattedString) {
        if (this.formattedText !== value) {
            ensureWeakEvents();

            if (this.formattedText) {
                weakEvents.removeWeakEventListener(this.formattedText, observable.Observable.propertyChangeEvent, this.onFormattedTextChanged, this);
            }
            this._setValue(TextBase.formattedTextProperty, value);
            if (value) {
                weakEvents.addWeakEventListener(value, observable.Observable.propertyChangeEvent, this.onFormattedTextChanged, this);
            }
        }
    }

    private onFormattedTextChanged(eventData: observable.PropertyChangeData) {
        var value = (<formattedString.FormattedString>eventData.value);
        this._setFormattedTextPropertyToNative(value);

        this._onPropertyChangedFromNative(TextBase.textProperty, value.toString());
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }

    public _setFormattedTextPropertyToNative(value) {
        //
    }

    public _onFormattedTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue = (<formattedString.FormattedString>data.newValue);
        if (newValue) {
            newValue.parent = this;
        }
        this._setFormattedTextPropertyToNative(newValue);

        var newText = newValue ? newValue.toString() : "";
        this._onPropertyChangedFromNative(TextBase.textProperty, newText);
    }

    public _addChildFromBuilder(name: string, value: any): void {
        formattedString.FormattedString.addFormattedStringToView(this, name, value);
    }

    _requestLayoutOnTextChanged(): void {
        this.requestLayout();
    }
}

tbs.TextBaseStyler.registerHandlers()
