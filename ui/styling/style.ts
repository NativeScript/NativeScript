import styling = require("ui/styling");
import observable = require("ui/core/dependency-observable");
import color = require("color");
import types = require("utils/types");
import trace = require("trace");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import stylers = require("ui/styling/stylers");
import styleProperty = require("ui/styling/style-property");
import converters = require("ui/styling/converters");
import enums = require("ui/enums");
import imageSource = require("image-source");
import utils = require("utils/utils");
import font = require("ui/styling/font");

// key is the property id and value is Dictionary<string, StylePropertyChangedHandler>;
var _registeredHandlers = Array<Object>();

// key is a className + property id and value is StylePropertyChangedHandler;
var _handlersCache = {};

// classes like Frame that does not need to handle styling properties.
var noStylingClasses = {};

export class Style extends observable.DependencyObservable implements styling.Style {
    private _view: view.View;
    private _inUpdate = false;
    private _nativeSetters = new Map<dependencyObservable.Property, any>();

    get color(): color.Color {
        return this._getValue(colorProperty);
    }
    set color(value: color.Color) {
        this._setValue(colorProperty, value, observable.ValueSource.Local);
    }

    get backgroundColor(): color.Color {
        return this._getValue(backgroundColorProperty);
    }
    set backgroundColor(value: color.Color) {
        this._setValue(backgroundColorProperty, value, observable.ValueSource.Local);
    }

    get backgroundImage(): string {
        return this._getValue(backgroundImageProperty);
    }
    set backgroundImage(value: string) {
        this._setValue(backgroundImageProperty, value, observable.ValueSource.Local);
    }

    get borderColor(): color.Color {
        return this._getValue(borderColorProperty);
    }
    set borderColor(value: color.Color) {
        this._setValue(borderColorProperty, value, observable.ValueSource.Local);
    }

    get borderWidth(): number {
        return this._getValue(borderWidthProperty);
    }
    set borderWidth(value: number) {
        this._setValue(borderWidthProperty, value, observable.ValueSource.Local);
    }

    get borderRadius(): number {
        return this._getValue(borderRadiusProperty);
    }
    set borderRadius(value: number) {
        this._setValue(borderRadiusProperty, value, observable.ValueSource.Local);
    }

    get fontSize(): number {
        return this._getValue(fontSizeProperty);
    }
    set fontSize(value: number) {
        this._setValue(fontSizeProperty, value, observable.ValueSource.Local);
    }

    get fontFamily(): string {
        return this._getValue(fontFamilyProperty);
    }
    set fontFamily(value: string) {
        this._setValue(fontFamilyProperty, value, observable.ValueSource.Local);
    }

    get fontStyle(): string {
        return this._getValue(fontStyleProperty);
    }
    set fontStyle(value: string) {
        this._setValue(fontStyleProperty, value, observable.ValueSource.Local);
    }

    get fontWeight(): string {
        return this._getValue(fontWeightProperty);
    }
    set fontWeight(value: string) {
        this._setValue(fontWeightProperty, value, observable.ValueSource.Local);
    }

    get font(): string {
        return this._getValue(fontProperty);
    }
    set font(value: string) {
        this._setValue(fontProperty, value, observable.ValueSource.Local);
    }

    get textAlignment(): string {
        return this._getValue(textAlignmentProperty);
    }
    set textAlignment(value: string) {
        this._setValue(textAlignmentProperty, value, observable.ValueSource.Local);
    }

    get minWidth(): number {
        return this._getValue(minWidthProperty);
    }
    set minWidth(value: number) {
        this._setValue(minWidthProperty, value, observable.ValueSource.Local);
    }

    get minHeight(): number {
        return this._getValue(minHeightProperty);
    }
    set minHeight(value: number) {
        this._setValue(minHeightProperty, value, observable.ValueSource.Local);
    }

    get width(): number {
        return this._getValue(widthProperty);
    }
    set width(value: number) {
        this._setValue(widthProperty, value, observable.ValueSource.Local);
    }

    get height(): number {
        return this._getValue(heightProperty);
    }
    set height(value: number) {
        this._setValue(heightProperty, value, observable.ValueSource.Local);
    }

    get margin(): string {
        return this._getValue(marginProperty);
    }
    set margin(value: string) {
        this._setValue(marginProperty, value, observable.ValueSource.Local);
    }

    get marginLeft(): number {
        return this._getValue(marginLeftProperty);
    }
    set marginLeft(value: number) {
        this._setValue(marginLeftProperty, value, observable.ValueSource.Local);
    }

    get marginTop(): number {
        return this._getValue(marginTopProperty);
    }
    set marginTop(value: number) {
        this._setValue(marginTopProperty, value, observable.ValueSource.Local);
    }

    get marginRight(): number {
        return this._getValue(marginRightProperty);
    }
    set marginRight(value: number) {
        this._setValue(marginRightProperty, value, observable.ValueSource.Local);
    }

    get marginBottom(): number {
        return this._getValue(marginBottomProperty);
    }
    set marginBottom(value: number) {
        this._setValue(marginBottomProperty, value, observable.ValueSource.Local);
    }

    get padding(): string {
        return this._getValue(paddingProperty);
    }
    set padding(value: string) {
        this._setValue(paddingProperty, value, observable.ValueSource.Local);
    }

    get paddingLeft(): number {
        return this._getValue(paddingLeftProperty);
    }
    set paddingLeft(value: number) {
        this._setValue(paddingLeftProperty, value, observable.ValueSource.Local);
    }

    get paddingTop(): number {
        return this._getValue(paddingTopProperty);
    }
    set paddingTop(value: number) {
        this._setValue(paddingTopProperty, value, observable.ValueSource.Local);
    }

    get paddingRight(): number {
        return this._getValue(paddingRightProperty);
    }
    set paddingRight(value: number) {
        this._setValue(paddingRightProperty, value, observable.ValueSource.Local);
    }

    get paddingBottom(): number {
        return this._getValue(paddingBottomProperty);
    }
    set paddingBottom(value: number) {
        this._setValue(paddingBottomProperty, value, observable.ValueSource.Local);
    }

    get horizontalAlignment(): string {
        return this._getValue(horizontalAlignmentProperty);
    }
    set horizontalAlignment(value: string) {
        this._setValue(horizontalAlignmentProperty, value, observable.ValueSource.Local);
    }

    get verticalAlignment(): string {
        return this._getValue(verticalAlignmentProperty);
    }
    set verticalAlignment(value: string) {
        this._setValue(verticalAlignmentProperty, value, observable.ValueSource.Local);
    }

    get visibility(): string {
        return this._getValue(visibilityProperty);
    }
    set visibility(value: string) {
        this._setValue(visibilityProperty, value, observable.ValueSource.Local);
    }

    get opacity(): number {
        return this._getValue(opacityProperty);
    }
    set opacity(value: number) {
        this._setValue(opacityProperty, value, observable.ValueSource.Local);
    }

    constructor(parentView: view.View) {
        super();
        this._view = parentView;
    }
    
    public _beginUpdate() {
        this._inUpdate = true;
    }

    public _endUpdate() {
        this._inUpdate = false;
        this._nativeSetters.forEach((newValue, property, map) => { this._applyStyleProperty(property, newValue); });
        this._nativeSetters.clear();
    }

    public _resetCssValues() {
        var that = this;
        this._eachSetProperty(function (property: observable.Property) {
            that._resetValue(property, observable.ValueSource.Css);
            return true;
        });
    }

    public _onPropertyChanged(property: dependencyObservable.Property, oldValue: any, newValue: any) {
        trace.write(
            "Style._onPropertyChanged view:" + this._view +
            ", property: " + property.name +
            ", oldValue: " + oldValue +
            ", newValue: " + newValue, trace.categories.Style);

        super._onPropertyChanged(property, oldValue, newValue);

        this._view._checkMetadataOnPropertyChanged(property.metadata);

        this._applyProperty(property, newValue);
    }

    public _syncNativeProperties() {
        var that = this;
        // loop all style properties and call the _applyProperty method
        // TODO: Potential performance bottle-neck
        styleProperty.eachProperty(function (p: styleProperty.Property) {
            var value = that._getValue(p);
            if (types.isDefined(value)) {
                that._applyProperty(p, value);
            }
        });
    }

    private _applyProperty(property: dependencyObservable.Property, newValue: any) {
        this._applyStyleProperty(property, newValue);

        // The effective value of an inheritable property has changed 
        // propagate the change down to the descendants to update their inherited properties.
        if (this._view._childrenCount === 0 || !property.metadata.inheritable) {
            return;
        }

        var eachChild = function (child: view.View): boolean {
            child.style._inheritStyleProperty(property);
            return true;
        }

        this._view._eachChildView(eachChild);
    }

    private _applyStyleProperty(property: dependencyObservable.Property, newValue: any) {
        if (this._inUpdate) {
            this._nativeSetters.set(property, newValue);
            return;
        }

        try {
            var handler: styling.stylers.StylePropertyChangedHandler = getHandler(property, this._view);

            if (!handler) {
                trace.write("No handler for property: " + property.name + " with id: " + property.id + ", view:" + this._view, trace.categories.Style);
            }
            else {
                trace.write("Found handler for property: " + property.name + ", view:" + this._view, trace.categories.Style);
                
                var shouldReset = false;
                if (property.metadata.equalityComparer) {
                    shouldReset = property.metadata.equalityComparer(newValue, property.metadata.defaultValue);
                }
                else {
                    shouldReset = (newValue === property.metadata.defaultValue);
                }

                if (shouldReset) {
                    (<any>handler).resetProperty(property, this._view);
                } else {
                    (<any>handler).applyProperty(property, this._view, newValue);
                }
            }
        }
        catch (ex) {
            trace.write("Error setting property: " + property.name + " on " + this._view + ": " + ex, trace.categories.Style, trace.messageType.error);
        }
    }

    public _inheritStyleProperty(property: dependencyObservable.Property) {
        if (!property.metadata.inheritable) {
            throw new Error("An attempt was made to inherit a style property which is not marked as 'inheritable'.");
        }

        var currentParent = this._view.parent;
        var valueSource: number;

        while (currentParent) {
            valueSource = currentParent.style._getValueSource(property);
            if (valueSource > dependencyObservable.ValueSource.Default) {
                this._setValue(property, currentParent.style._getValue(property), dependencyObservable.ValueSource.Inherited);
                break;
            }

            currentParent = currentParent.parent;
        }
    }

    public _inheritStyleProperties() {
        var that = this;
        styleProperty.eachInheritableProperty((p) => {
            that._inheritStyleProperty(p);
        });
    }
}

export function registerHandler(property: dependencyObservable.Property,
    handler: styling.stylers.StylePropertyChangedHandler,
    className?: string) {
    var realClassName = className ? className : "default";

    var handlerRecord = _registeredHandlers[property.id];
    if (!handlerRecord) {
        handlerRecord = {};
        _registeredHandlers[property.id] = handlerRecord;
    }

    handlerRecord[realClassName] = handler;
}

export function registerNoStylingClass(className) {
    noStylingClasses[className] = 1;
}

export function getHandler(property: dependencyObservable.Property, view: view.View): styling.stylers.StylePropertyChangedHandler {
    return getHandlerInternal(property.id, types.getClassInfo(view));
}

function getHandlerInternal(propertyId: number, classInfo: types.ClassInfo): styling.stylers.StylePropertyChangedHandler {
    var className = classInfo ? classInfo.name : "default";
    var handlerKey = className + propertyId;

    // try the cache first
    var result = _handlersCache[handlerKey];
    if (types.isDefined(result)) {
        return result;
    }

    var propertyHandlers = _registeredHandlers[propertyId];
    if (noStylingClasses.hasOwnProperty(className) || !propertyHandlers) {
        // Reached 'no-styling' class or no property handlers are registered for this proeprtyID
        result = null;
    }
    else if (propertyHandlers.hasOwnProperty(className)) {
        // Found handler for this class
        result = propertyHandlers[className];
    }
    else if (classInfo) {
        // Check the base class
        result = getHandlerInternal(propertyId, classInfo.baseClassInfo);
    }
    else {
        result = null;
    }

    _handlersCache[handlerKey] = result;
    return result;
}

// Property registration
export var colorProperty = new styleProperty.Property("color", "color",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.Inheritable, undefined, undefined, color.Color.equals),
    converters.colorConverter);

export var backgroundImageProperty = new styleProperty.Property("backgroundImage", "background-image",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.None, onBackgroundImagePropertyChanged));

function onBackgroundImagePropertyChanged(data: observable.PropertyChangeData) {
    var view: view.View = (<any>data.object)._view;
    var style = <Style>data.object;
    var url: string = data.newValue;

    style._setValue(backgroundImageSourceProperty, undefined, observable.ValueSource.Local);

    if (types.isString(data.newValue)) {
        var pattern: RegExp = /url\(('|")(.*?)\1\)/;
        var match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }

        if (utils.isDataURI(url)) {
            var base64Data = url.split(",")[1];
            if (types.isDefined(base64Data)) {
                style._setValue(backgroundImageSourceProperty, imageSource.fromBase64(base64Data), observable.ValueSource.Local);
            }
        } else if (utils.isFileOrResourcePath(url)) {
            style._setValue(backgroundImageSourceProperty, imageSource.fromFileOrResource(url), observable.ValueSource.Local);
        } else if (url.indexOf("http") !== -1) {
            if (view) {
                view["_url"] = url;
            }
            imageSource.fromUrl(url).then(r=> {
                if (view && view["_url"] === url) {
                    style._setValue(backgroundImageSourceProperty, r, observable.ValueSource.Local);
                }
            });
        }
    }
}

export var borderColorProperty = new styleProperty.Property("borderColor", "border-color",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.None, undefined, undefined, color.Color.equals),
    converters.colorConverter);

export var borderWidthProperty = new styleProperty.Property("borderWidth", "border-width",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var borderRadiusProperty = new styleProperty.Property("borderRadius", "border-radius",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var backgroundImageSourceProperty = new styleProperty.Property("backgroundImageSource", "background-image-source",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.None, undefined, undefined, undefined));

export var backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.None, undefined, undefined, color.Color.equals),
    converters.colorConverter);

export var fontProperty = new styleProperty.Property("font", "font",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.None, onFontChanged));

export var fontSizeProperty = new styleProperty.Property("fontSize", "font-size",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.Inheritable, onFontSizeChanged),converters.fontSizeConverter);

export var fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.Inheritable, onFontFamilyChanged));

export var fontStyleProperty = new styleProperty.Property("fontStyle", "font-style",
    new observable.PropertyMetadata(enums.FontStyle.normal, observable.PropertyMetadataSettings.Inheritable, onFontStyleChanged, isFontStyleValid));

export var fontWeightProperty = new styleProperty.Property("fontWeight", "font-weight",
    new observable.PropertyMetadata(enums.FontWeight.normal, observable.PropertyMetadataSettings.Inheritable, onFontWeightChanged, isFontWeightValid));

export var fontInternalProperty = new styleProperty.Property("_fontInternal", "_fontInternal",
    new observable.PropertyMetadata(font.Font.default, observable.PropertyMetadataSettings.AffectsLayout, null, null, font.Font.equals), font.Font.parse);

function isFontWeightValid(value: string): boolean {
    return value === enums.FontWeight.normal || value === enums.FontWeight.bold;
}

function isFontStyleValid(value: string): boolean {
    return value === enums.FontStyle.normal || value === enums.FontStyle.italic;
}

function onFontFamilyChanged(data: observable.PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontFamily !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontFamily(data.newValue));
    }
}

function onFontStyleChanged(data: observable.PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontStyle !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontStyle(data.newValue));
    }
}

function onFontWeightChanged(data: observable.PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontWeight !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontWeight(data.newValue));
    }
}

function onFontSizeChanged(data: observable.PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontSize !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontSize(data.newValue));
    }
}

function onFontChanged(data: observable.PropertyChangeData) {
    var style = <Style>data.object;

    var newFont = font.Font.parse(data.newValue);
    var valueSource = style._getValueSource(fontProperty); 
    style._setValue(fontFamilyProperty, newFont.fontFamily, valueSource);
    style._setValue(fontStyleProperty, newFont.fontStyle, valueSource);
    style._setValue(fontWeightProperty, newFont.fontWeight, valueSource);
    style._setValue(fontSizeProperty, newFont.fontSize, valueSource);
}

export var textAlignmentProperty = new styleProperty.Property("textAlignment", "text-align",
    new observable.PropertyMetadata(undefined, observable.PropertyMetadataSettings.AffectsLayout | observable.PropertyMetadataSettings.Inheritable),
    converters.textAlignConverter);

function isWidthHeightValid(value: number): boolean {
    return isNaN(value) || (value >= 0.0 && isFinite(value));
}

function isMinWidthHeightValid(value: number): boolean {
    return !isNaN(value) && value >= 0.0 && isFinite(value);
}

export var widthProperty = new styleProperty.Property("width", "width",
    new observable.PropertyMetadata(
        Number.NaN, observable.PropertyMetadataSettings.AffectsLayout, null, isWidthHeightValid),
    converters.numberConverter);

export var heightProperty = new styleProperty.Property("height", "height",
    new observable.PropertyMetadata(
        Number.NaN, observable.PropertyMetadataSettings.AffectsLayout, null, isWidthHeightValid),
    converters.numberConverter);

export var minWidthProperty = new styleProperty.Property("minWidth", "min-width",
    new observable.PropertyMetadata(
        0, observable.PropertyMetadataSettings.AffectsLayout, null, isMinWidthHeightValid),
    converters.numberConverter);

export var minHeightProperty = new styleProperty.Property("minHeight", "min-height",
    new observable.PropertyMetadata(
        0, observable.PropertyMetadataSettings.AffectsLayout, null, isMinWidthHeightValid),
    converters.numberConverter);

function parseThickness(value: any): { top: number; right: number; bottom: number; left: number } {
    var result = { top: 0, right: 0, bottom: 0, left: 0 };
    if (types.isString(value)) {
        var arr = value.split(/[ ,]+/);
        var top = parseInt(arr[0]);
        top = isNaN(top) ? 0 : top;

        var right = parseInt(arr[1]);
        right = isNaN(right) ? top : right;

        var bottom = parseInt(arr[2]);
        bottom = isNaN(bottom) ? top : bottom;

        var left = parseInt(arr[3]);
        left = isNaN(left) ? right : left;

        result.top = top;
        result.right = right;
        result.bottom = bottom;
        result.left = left;

    } else if (types.isNumber(value)) {
        result.top = result.right = result.bottom = result.left = value;
    }

    return result;
}

function onPaddingChanged(data: observable.PropertyChangeData) {
    var thickness = parseThickness(data.newValue);
    var style = <Style>data.object;

    style.paddingTop = thickness.top;
    style.paddingRight = thickness.right;
    style.paddingBottom = thickness.bottom;
    style.paddingLeft = thickness.left;
}

function onMarginChanged(data: observable.PropertyChangeData) {
    var thickness = parseThickness(data.newValue);
    var style = <Style>data.object;

    style.marginTop = thickness.top;
    style.marginRight = thickness.right;
    style.marginBottom = thickness.bottom;
    style.marginLeft = thickness.left;
}

export var verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align",
    new observable.PropertyMetadata(enums.VerticalAlignment.stretch, observable.PropertyMetadataSettings.AffectsLayout));

export var horizontalAlignmentProperty = new styleProperty.Property("horizontalAlignment", "horizontal-align",
    new observable.PropertyMetadata(enums.HorizontalAlignment.stretch, observable.PropertyMetadataSettings.AffectsLayout));

export var marginProperty = new styleProperty.Property("margin", "margin",
    new observable.PropertyMetadata(null, null, onMarginChanged));

export var paddingProperty = new styleProperty.Property("padding", "padding",
    new observable.PropertyMetadata(null, null, onPaddingChanged));

export var marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isMarginValid), converters.numberConverter);

export var marginRightProperty = new styleProperty.Property("marginRight", "margin-right",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isMarginValid), converters.numberConverter);

export var marginTopProperty = new styleProperty.Property("marginTop", "margin-top",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isMarginValid), converters.numberConverter);

export var marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isMarginValid), converters.numberConverter);

export var paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom",
    new observable.PropertyMetadata(0, observable.PropertyMetadataSettings.AffectsLayout, null, isPaddingValid), converters.numberConverter);

function isVisibilityValid(value: string): boolean {
    return value === enums.Visibility.visible || value === enums.Visibility.collapse || value === enums.Visibility.collapsed;
}

function setLayoutInfoVisibility(data: observable.PropertyChangeData) {
    (<any>data.object)._view._isVisibleCache = (data.newValue !== enums.Visibility.collapse || data.newValue !== enums.Visibility.collapsed);
}

export var visibilityProperty = new styleProperty.Property("visibility", "visibility",
    new observable.PropertyMetadata(enums.Visibility.visible, observable.PropertyMetadataSettings.AffectsLayout, setLayoutInfoVisibility, isVisibilityValid),
    converters.visibilityConverter);

function isPaddingValid(value: number): boolean {
    return isFinite(value) && !isNaN(value) && value >= 0;
}

function isMarginValid(value: number): boolean {
    return isFinite(value) && !isNaN(value);
}

function isOpacityValid(value: string): boolean {
    var parsedValue: number = parseFloat(value);
    return !isNaN(parsedValue) && 0 <= parsedValue && parsedValue <= 1;
}

export var opacityProperty = new styleProperty.Property("opacity", "opacity",
    new observable.PropertyMetadata(1.0, observable.PropertyMetadataSettings.None, undefined, isOpacityValid),
    converters.opacityConverter);

// register default stylers once all properties are defined.
stylers._registerDefaultStylers();