import definition = require("ui/text-base");
import view = require("ui/core/view");
import types = require("utils/types");
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
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

var formattedTextProperty = new dependencyObservable.Property(
    "formattedText",
    "TextBase",
    new proxy.PropertyMetadata("", dependencyObservable.PropertyMetadataSettings.AffectsLayout)
    );

function onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textBase = <TextBase>data.object;
    textBase._onTextPropertyChanged(data);
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

    constructor(options?: definition.Options) {
        super(options);
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.formattedText) {
            this.formattedText.updateSpansBindingContext(newValue);
        }
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
        this.setFormattedTextPropertyToNative(eventData.value);
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var newValue = types.isNullOrUndefined(data.newValue) ? "" : data.newValue + "";
        if (this.android) {
            this.android.setText(newValue);
        }
        else if (this.ios) {
            this.ios.text = newValue;
            this.style._updateTextDecoration();
            this.style._updateTextTransform();
        }
    }

    private setFormattedTextPropertyToNative(value) {
        if (this.android) {
            this.android.setText(value._formattedText);
        } else if (this.ios) {
            this.ios.attributedText = value._formattedText;
            this.style._updateTextDecoration();
            this.style._updateTextTransform();
            this.requestLayout();
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

tbs.TextBaseStyler.registerHandlers()
