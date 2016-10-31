import { FormattedString as FormattedStringDefinition, FormattedStringView } from "text/formatted-string";
import { Span } from "text/span";
import { Observable, PropertyChangeData } from "data/observable";
import { ObservableArray, ChangedData } from "data/observable-array";
import { View, AddArrayFromBuilder, AddChildFromBuilder } from "ui/core/view";
import { isString } from "utils/types";
import { Color } from "color";

export module knownCollections {
    export let spans = "spans";
}

let CHILD_SPAN = "Span";
let CHILD_FORMATTED_TEXT = "formattedText";
let CHILD_FORMATTED_STRING = "FormattedString";

export abstract class FormattedStringBase extends Observable implements FormattedStringDefinition, AddArrayFromBuilder, AddChildFromBuilder {
    private _spans: ObservableArray<Span>;
    private _isDirty: boolean;
    private _fontFamily: string;
    private _fontSize: number;
    private _foregroundColor: Color;
    private _backgroundColor: Color;
    private _underline: number;
    private _strikethrough: number;
    private _fontAttributes: number;
    private _parent: View;

    public _formattedText: any;

    constructor() {
        super();
        this._spans = new ObservableArray<Span>();
        this._spans.addEventListener(ObservableArray.changeEvent, this.onSpansCollectionChanged, this);
        this._isDirty = true;
    }

    get parent(): View {
        return this._parent;
    }
    set parent(value: View) {
        if (this._parent !== value) {
            this._parent = value;
        }
    }

    get fontFamily(): string {
        return this._fontFamily;
    }
    set fontFamily(value: string) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
        }
    }

    get fontSize(): number {
        return this._fontSize;
    }
    set fontSize(value: number) {
        let fSize: number;
        if (isString(value)) {
            fSize = parseInt(<any>value);
        }
        else {
            fSize = value;
        }
        if (this._fontSize !== fSize) {
            this._fontSize = fSize;
        }
    }

    get foregroundColor(): Color {
        return this._foregroundColor;
    }
    set foregroundColor(value: Color) {
        let foreColor;
        if (isString(value)) {
            foreColor = new Color(<any>value);
        }
        else {
            foreColor = value;
        }
        if (this._foregroundColor !== foreColor) {
            this._foregroundColor = foreColor;
        }
    }

    get backgroundColor(): Color {
        return this._backgroundColor;
    }
    set backgroundColor(value: Color) {
        let backColor;
        if (isString(value)) {
            backColor = new Color(<any>value);
        }
        else {
            backColor = value;
        }
        if (this._backgroundColor !== backColor) {
            this._backgroundColor = backColor;
        }
    }

    get underline(): number {
        return this._underline;
    }
    set underline(value: number) {
        let underlineIntValue: number;
        if (isString(value)) {
            underlineIntValue = parseInt(<any>value);
        }
        else {
            underlineIntValue = value;
        }
        if (this._underline !== underlineIntValue) {
            this._underline = underlineIntValue;
        }
    }

    get strikethrough(): number {
        return this._strikethrough;
    }
    set strikethrough(value: number) {
        let strikethroughIntValue: number;
        if (isString(value)) {
            strikethroughIntValue = parseInt(<any>value);
        }
        else {
            strikethroughIntValue = value;
        }
        if (this._strikethrough !== strikethroughIntValue) {
            this._strikethrough = strikethroughIntValue;
        }
    }

    get fontAttributes(): number {
        return this._fontAttributes;
    }
    set fontAttributes(value: number) {
        if (this._fontAttributes !== value) {
            this._fontAttributes = value;
        }
    }

    get spans(): ObservableArray<Span> {
        if (!this._spans) {
            this._spans = new ObservableArray<Span>();
        }
        return this._spans;
    }

    public abstract createFormattedStringCore(): void;

    public abstract _updateCharactersInRangeReplacementString(rangeLocation: number, rangeLength: number, replacementString: string): void;

    public toString(): string {
        let result = "";
        for (let i = 0, length = this._spans.length; i < length; i++) {
            result += this._spans.getItem(i).text;
        }
        return result;
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        let i;
        let span;
        if (name === knownCollections.spans) {
            for (i = 0; i < value.length; i++) {
                span = value[i];
                this.spans.push(span);
            }
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === CHILD_SPAN) {
            this.spans.push(value);
        }
    }

    public updateSpansBindingContext(newBindingContext) {
        for (let i = 0, length = this.spans.length; i < length; i++) {
            let span = this.spans.getItem(i);
            span.bindingContext = newBindingContext;
        }
    }

    public static addFormattedStringToView(view: FormattedStringView, name: string, value: any): void {
        if (name === CHILD_SPAN) {
            // NOTE: getter should either initialize the value or do it in the constructor.
            // if (!view.formattedText) {
            //     view.formattedText = new FormattedString();
            // }
            view.formattedText.spans.push(value);
        }
        else if (name === CHILD_FORMATTED_TEXT || name === CHILD_FORMATTED_STRING) {
            view.formattedText = value;
        }
    }

    private onSpansCollectionChanged(eventData: ChangedData<Span>) {
        if (eventData.addedCount > 0) {
            for (let i = 0; i < eventData.addedCount; i++) {
                let addedSpan: Span = (<ObservableArray<Span>>eventData.object).getItem(eventData.index + i);
                addedSpan.parentFormattedString = this;
                addedSpan.addEventListener(Observable.propertyChangeEvent, this.onSpanChanged, this);
            }
        }
        if (eventData.removed && eventData.removed.length > 0) {
            for (let p = 0; p < eventData.removed.length; p++) {
                let removedSpan = eventData.removed[p];
                removedSpan.removeEventListener(Observable.propertyChangeEvent, this.onSpanChanged, this);
            }
        }
        this.updateFormattedText(true);
    }

    private onSpanChanged(eventData: PropertyChangeData) {
        this.updateFormattedText(true);
    }

    private updateFormattedText(isDirty?: boolean) {
        let shouldUpdate = isDirty || this._isDirty;
        if (shouldUpdate) {
            this.createFormattedStringCore();
            this._isDirty = false;
            this.notify(this._createPropertyChangeData("", this));
        }
    }
}