import {TextBase as TextBaseDefinition} from "ui/text-base";
import {View} from "ui/core/view";
import {Observable, PropertyChangeData} from "data/observable";
import {FormattedString, FormattedStringView} from "text/formatted-string";
import {isIOS} from "platform";
import {Property} from "ui/core/properties";
import * as weakEventListenerModule from "ui/core/weak-event-listener";

let weakEvents: typeof weakEventListenerModule;
function ensureWeakEvents() {
    if (!weakEvents) {
        weakEvents = require("ui/core/weak-event-listener");
    }
}

function onFormattedTextPropertyChanged(textBase: TextBase, oldValue: FormattedString, newValue: FormattedString) {
    ensureWeakEvents();
    if (oldValue) {
        oldValue.parent = null;
        weakEvents.removeWeakEventListener(oldValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }

    if (newValue) {
        newValue.parent = textBase;
        weakEvents.addWeakEventListener(newValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }

    // textBase._onFormattedTextPropertyChanged(newValue);
}
function onTextPropertyChanged(textBase: TextBase, oldValue: string, newValue: string) {
    // textBase._onTextPropertyChanged(newValue);

    // //RemoveThisDoubleCall
    // textBase.style._updateTextTransform();
    // textBase.style._updateTextDecoration();
}

// (<proxy.PropertyMetadata>textProperty.metadata).onSetNativeValue = onTextPropertyChanged;
// (<proxy.PropertyMetadata>formattedTextProperty.metadata).onSetNativeValue = onFormattedTextPropertyChanged;

export class TextBase extends View implements TextBaseDefinition, FormattedStringView {

    // public _onBindingContextChanged(oldValue: any, newValue: any) {
    //     super._onBindingContextChanged(oldValue, newValue);
    //     if (this.formattedText) {
    //         this.formattedText.updateSpansBindingContext(newValue);
    //     }

    //     //This is because of ListView virtualization
    //     //RemoveThisDoubleCall        
    //     this.style._updateTextTransform();
    //     this.style._updateTextDecoration();
    // }

    public text: string;
    public formattedText: FormattedString;

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

    public onFormattedTextChanged(data: PropertyChangeData) {
        let value = data.value;
        this._setFormattedTextPropertyToNative(value);
        this.nativePropertyChanged(textProperty, value.toString());
    }

    public _onTextPropertyChanged(newValue: string) {
        //
    }

    public _setFormattedTextPropertyToNative(value) {
        //
    }

    public _onFormattedTextPropertyChanged(newValue: FormattedString) {
        this._setFormattedTextPropertyToNative(newValue);
        let newText = newValue ? newValue.toString() : "";
        this.nativePropertyChanged(textProperty, newText);
    }

    public _addChildFromBuilder(name: string, value: any): void {
        FormattedString.addFormattedStringToView(this, name, value);
    }

    _requestLayoutOnTextChanged(): void {
        this.requestLayout();
    }
}

export let textProperty = new Property<TextBase, string>({ name: "text", defaultValue: "", valueChanged: onTextPropertyChanged });
textProperty.register(TextBase);

export let formattedTextProperty = new Property<TextBase, FormattedString>({ name: "formattedText", affectsLayout: isIOS, valueChanged: onFormattedTextPropertyChanged });
formattedTextProperty.register(TextBase);