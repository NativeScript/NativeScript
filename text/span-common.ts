import colorModule = require("color");
import definition = require("text/span");
import bindable = require("ui/core/bindable");
import types = require("utils/types");
import view = require("ui/core/view");
import enums = require("ui/enums");
import formattedString = require("text/formatted-string");

export class Span extends bindable.Bindable implements definition.Span, view.ApplyXmlAttributes {
    private _fontFamily: string;
    private _fontSize: number;
    private _foregroundColor: colorModule.Color;
    private _backgroundColor: colorModule.Color;
    private _text: string;
    private _underline: number;
    private _strikethrough: number;
    private _fontAttributes: number;
    private _spanModifiers: Array<any>;
    private _parentFormattedString: formattedString.FormattedString;
    private _isInEditMode: boolean;
    
    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(value: string) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
            this.updateAndNotify();
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
            this.updateAndNotify();
        }
    }

    private _getColorValue(value: any): colorModule.Color {
        var result;
        if (types.isString(value) && (<any>value).indexOf("#") === 0) {
            result = new colorModule.Color(<any>value);
        }
        else {
            result = value;
        }
        return result;
    }

    get foregroundColor(): colorModule.Color {
        return this._foregroundColor;
    }
    set foregroundColor(value: colorModule.Color) {
        var convertedColor = this._getColorValue(value);
        if (this._foregroundColor !== convertedColor) {
            this._foregroundColor = convertedColor;
            this.updateAndNotify();
        }
    }

    get backgroundColor(): colorModule.Color {
        return this._backgroundColor;
    }
    set backgroundColor(value: colorModule.Color) {
        var convertedColor = this._getColorValue(value);
        if (this._backgroundColor !== convertedColor) {
            this._backgroundColor = convertedColor;
            this.updateAndNotify();
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
            this.updateAndNotify();
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
            this.updateAndNotify();
        }
    }

    get fontAttributes(): number {
        return this._fontAttributes;
    }

    set fontAttributes(value: number) {
        if (this._fontAttributes !== value) {
            this._fontAttributes = value;
            this.updateAndNotify();
        }
    }

    get spanModifiers(): Array<any> {
        if (!this._spanModifiers) {
            this._spanModifiers = new Array();
        }
        return this._spanModifiers;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        if (this._text !== value) {
            this._text = value;
            this.updateAndNotify();
        }
    }

    get parentFormattedString(): formattedString.FormattedString {
        return this._parentFormattedString;
    }

    set parentFormattedString(value: formattedString.FormattedString) {
        if (this._parentFormattedString !== value) {
            this._parentFormattedString = value;
            this.updateAndNotify();
        }
    }

    public updateSpanModifiers(parent: formattedString.FormattedString) {
        // a virtual method overriden in platform specific implementations.
        if (this._isInEditMode) {
            throw new Error("Cannot update span modifiers during update!");
        }
        this._spanModifiers = new Array();
    }

    public beginEdit(): void {
        this._isInEditMode = true;
    }

    private updateAndNotify() {
        if (!this._isInEditMode) {
            this.updateSpanModifiers(this.parentFormattedString);
            this.notify(this._createPropertyChangeData(".", this));
        }
    }

    public endEdit(): void {
        this._isInEditMode = false;
        this.updateAndNotify();
    }

    public applyXmlAttribute(attribute, value): boolean {
        if (attribute === "fontAttributes") {
            if (value.indexOf(",")) {
                var fontAttr = value.split(",");
                var fontAttrValue;
                var j;
                for (j = 0; j < fontAttr.length; j++) {
                    fontAttrValue = Span.getFontAttributeFromString(fontAttr[j]);
                    this.fontAttributes |= fontAttrValue;
                }
            }
            else {
                this.fontAttributes |= value;
            }
            return true;
        }
        else {
            return false;
        }
    }

    private static getFontAttributeFromString(fontAttr: string) {
        var fontAttrTrimmedAndLowerCase = fontAttr.trim().toLowerCase();
        if (fontAttrTrimmedAndLowerCase === "bold") {
            return enums.FontAttributes.Bold;
        }
        else if (fontAttrTrimmedAndLowerCase === "italic") {
            return enums.FontAttributes.Italic;
        }
        else {
            return enums.FontAttributes.Normal;
        }
    }
}