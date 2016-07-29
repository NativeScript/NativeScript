import spanModule = require("text/span");
import observable = require("data/observable");
import observableArray = require("data/observable-array");
import definition = require("text/formatted-string");
import view = require("ui/core/view");
import types = require("utils/types");
import colorModule = require("color");

export module knownCollections {
    export var spans = "spans";
}

var CHILD_SPAN = "Span";
var CHILD_FORMATTED_TEXT = "formattedText";
var CHILD_FORMATTED_STRING = "FormattedString";

export class FormattedString extends observable.Observable implements definition.FormattedString, view.AddArrayFromBuilder {
    private _spans: observableArray.ObservableArray<spanModule.Span>;
    public _formattedText: any;
    private _isDirty: boolean;
    private _fontFamily: string;
    private _fontSize: number;
    private _foregroundColor: colorModule.Color;
    private _backgroundColor: colorModule.Color;
    private _underline: number;
    private _strikethrough: number;
    private _fontAttributes: number;
    private _parent: view.View;

    get parent(): view.View {
        return this._parent;
    }

    set parent(value: view.View) {
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
        var fSize: number;
        if (types.isString(value)) {
            fSize = parseInt(<any>value);
        }
        else {
            fSize = value;
        }
        if (this._fontSize !== fSize) {
            this._fontSize = fSize;
        }
    }

    get foregroundColor(): colorModule.Color {
        return this._foregroundColor;
    }
    set foregroundColor(value: colorModule.Color) {
        var foreColor;
        if (types.isString(value)) {
            foreColor = new colorModule.Color(<any>value);
        }
        else {
            foreColor = value;
        }
        if (this._foregroundColor !== foreColor) {
            this._foregroundColor = foreColor;
        }
    }

    get backgroundColor(): colorModule.Color {
        return this._backgroundColor;
    }
    set backgroundColor(value: colorModule.Color) {
        var backColor;
        if (types.isString(value)) {
            backColor = new colorModule.Color(<any>value);
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
        var underlineIntValue: number;
        if (types.isString(value)) {
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
        var strikethroughIntValue: number;
        if (types.isString(value)) {
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

    constructor() {
        super();
        this._spans = new observableArray.ObservableArray<spanModule.Span>();
        this._spans.addEventListener(observableArray.ObservableArray.changeEvent, this.onSpansCollectionChanged, this);
        this._isDirty = true;
    }

    get spans(): observableArray.ObservableArray<spanModule.Span> {
        if (!this._spans) {
            this._spans = new observableArray.ObservableArray<spanModule.Span>();
        }
        return this._spans;
    }

    private onSpansCollectionChanged(eventData: observableArray.ChangedData<spanModule.Span>) {
        var i;
        if (eventData.addedCount > 0) {
            for (i = 0; i < eventData.addedCount; i++) {
                var addedSpan: spanModule.Span = (<observableArray.ObservableArray<spanModule.Span>>eventData.object).getItem(eventData.index + i);
                addedSpan.parentFormattedString = this;
                addedSpan.addEventListener(observable.Observable.propertyChangeEvent, this.onSpanChanged, this);
            }
        }
        if (eventData.removed && eventData.removed.length > 0) {
            var p;
            for (p = 0; p < eventData.removed.length; p++) {
                var removedSpan = eventData.removed[p];
                removedSpan.removeEventListener(observable.Observable.propertyChangeEvent, this.onSpanChanged, this);
            }
        }
        this.updateFormattedText(true);
    }

    private onSpanChanged(eventData: observable.PropertyChangeData) {
        this.updateFormattedText(true);
    }

    private updateFormattedText(isDirty?: boolean) {
        var shouldUpdate = isDirty || this._isDirty;
        if (shouldUpdate) {
            this.createFormattedStringCore();
            this._isDirty = false;
            this.notify(this._createPropertyChangeData("", this));
        }
    }

    public createFormattedStringCore() {
        // a virtual method overriden in platform specific implementations.
    }

    public toString(): string {
        var result = "";
        var i;
        for (i = 0; i < this._spans.length; i++) {
            result += this._spans.getItem(i).text;
        }
        return result;
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        var i;
        var span;
        if (name === knownCollections.spans) {
            for (i = 0; i < value.length; i++) {
                span = value[i];
                this.spans.push(span);
            }
        }
    }

    public updateSpansBindingContext(newBindingContext) {
        var i;
        for (i = 0; i < this.spans.length; i++) {
            var span = this.spans.getItem(i);
            span.bindingContext = newBindingContext;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if(name === CHILD_SPAN) {
            this.spans.push(value);
        }
    }

    public static addFormattedStringToView(view: definition.FormattedStringView, name: string, value: any): void {
        if(name === CHILD_SPAN) {
            if (!view.formattedText) {
                view.formattedText = new FormattedString();
            }
            view.formattedText.spans.push(value);
        }
        else if (name === CHILD_FORMATTED_TEXT || name === CHILD_FORMATTED_STRING) {
            view.formattedText = value;
        }
    }

    public _updateCharactersInRangeReplacementString(rangeLocation: number, rangeLength: number, replacementString: string): void {
        //
    }
}