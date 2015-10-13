import styling = require("ui/styling");
import types = require("utils/types");
import trace = require("trace");
import {DependencyObservable, PropertyMetadata, PropertyMetadataSettings, PropertyChangeData, Property, ValueSource, NativeValueResult} from "ui/core/dependency-observable";
import {View} from "ui/core/view";
import {Color} from "color";
import stylers = require("ui/styling/stylers");
import styleProperty = require("ui/styling/style-property");
import converters = require("./converters");
import enums = require("ui/enums");
import imageSource = require("image-source");
import utils = require("utils/utils");
import font = require("ui/styling/font");
import background = require("ui/styling/background");

// key is the property id and value is Dictionary<string, StylePropertyChangedHandler>;
var _registeredHandlers = Array<Object>();

// key is a className + property id and value is StylePropertyChangedHandler;
var _handlersCache = {};

// classes like Frame that does not need to handle styling properties.
var noStylingClasses = {};

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = global.android ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

export interface Thickness {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface CommonLayoutParams {
    width: number;
    height: number;

    leftMargin: number;
    topMargin: number;
    rightMargin: number;
    bottomMargin: number;

    horizontalAlignment: string;
    verticalAlignment: string;
}

function parseThickness(value: any): Thickness {
    var result: Thickness = { top: 0, right: 0, bottom: 0, left: 0 };
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
    else {
        result = value;
    }

    return result;
}

function layoutParamsComparer(x: CommonLayoutParams, y: CommonLayoutParams): boolean {
    return x.width === y.width
        && x.height === y.height
        && x.leftMargin === y.leftMargin
        && x.topMargin === y.topMargin
        && x.rightMargin === y.rightMargin
        && x.bottomMargin === y.bottomMargin
        && x.horizontalAlignment === y.horizontalAlignment
        && x.verticalAlignment === y.verticalAlignment
}

function onLayoutParamsChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var layoutParams: CommonLayoutParams = {
        width: isNaN(style.width) ? -1 : style.width,
        height: isNaN(style.height) ? -1 : style.height,
        leftMargin: style.marginLeft,
        topMargin: style.marginTop,
        rightMargin: style.marginRight,
        bottomMargin: style.marginBottom,
        horizontalAlignment: style.horizontalAlignment,
        verticalAlignment: style.verticalAlignment
    };

    style._setValue(nativeLayoutParamsProperty, layoutParams);
}

function onPaddingValueChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var thickness: Thickness = {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft
    };

    style._setValue(nativePaddingsProperty, thickness);
}

function thicknessComparer(x: Thickness, y: Thickness): boolean {
    if (x && y) {
        return x.left === y.left && x.top === y.top && x.right === y.right && x.bottom === y.bottom;
    }
    return !x === !y;
}

function isWidthHeightValid(value: number): boolean {
    return isNaN(value) || (value >= 0.0 && isFinite(value));
}

function isMinWidthHeightValid(value: number): boolean {
    return !isNaN(value) && value >= 0.0 && isFinite(value);
}

function onBackgroundImagePropertyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var url: string = data.newValue;
    var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    var isValid = false;

    if (types.isString(data.newValue)) {
        var pattern: RegExp = /url\(('|")(.*?)\1\)/;
        var match = url.match(pattern);
        if (match && match[2]) {
            url = match[2];
        }

        if (utils.isDataURI(url)) {
            var base64Data = url.split(",")[1];
            if (types.isDefined(base64Data)) {
                style._setValue(backgroundInternalProperty, currentBackground.withImage(imageSource.fromBase64(base64Data)));
                isValid = true;
            }
        }
        else if (utils.isFileOrResourcePath(url)) {
            style._setValue(backgroundInternalProperty, currentBackground.withImage(imageSource.fromFileOrResource(url)));
            isValid = true;
        }
        else if (url.indexOf("http") !== -1) {
            style["_url"] = url;
            style._setValue(backgroundInternalProperty, currentBackground.withImage(undefined));
            imageSource.fromUrl(url).then((r) => {
                if (style && style["_url"] === url) {
                    style._setValue(backgroundInternalProperty, currentBackground.withImage(r));
                }
            });
            isValid = true;
        }
    }

    if (!isValid) {
        style._setValue(backgroundInternalProperty, currentBackground.withImage(undefined));
    }
}

function onBackgroundColorPropertyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (!Color.equals(currentBackground.color, data.newValue)) {
        style._setValue(backgroundInternalProperty, currentBackground.withColor(data.newValue));
    }
}

function onBackgroundSizePropertyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.size) {
        style._setValue(backgroundInternalProperty, currentBackground.withSize(data.newValue));
    }
}

function onBackgroundRepeatPropertyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.repeat) {
        style._setValue(backgroundInternalProperty, currentBackground.withRepeat(data.newValue));
    }
}

function onBackgroundPositionPropertyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.position) {
        style._setValue(backgroundInternalProperty, currentBackground.withPosition(data.newValue));
    }
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
        // Reached 'no-styling' class or no property handlers are registered for this propertyID
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

function isVisibilityValid(value: string): boolean {
    return value === enums.Visibility.visible || value === enums.Visibility.collapse || value === enums.Visibility.collapsed;
}

function onVisibilityChanged(data: PropertyChangeData) {
    (<any>data.object)._view._isVisibleCache = data.newValue === enums.Visibility.visible;
}

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

function isFontWeightValid(value: string): boolean {
    return value === enums.FontWeight.normal || value === enums.FontWeight.bold;
}

function isFontStyleValid(value: string): boolean {
    return value === enums.FontStyle.normal || value === enums.FontStyle.italic;
}

function onFontFamilyChanged(data: PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontFamily !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontFamily(data.newValue));
    }
}

function onFontStyleChanged(data: PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontStyle !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontStyle(data.newValue));
    }
}

function onFontWeightChanged(data: PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontWeight !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontWeight(data.newValue));
    }
}

function onFontSizeChanged(data: PropertyChangeData) {
    var style = <Style>data.object;

    var currentFont = <font.Font>style._getValue(fontInternalProperty);
    if (currentFont.fontSize !== data.newValue) {
        style._setValue(fontInternalProperty, currentFont.withFontSize(data.newValue));
    }
}

export class Style extends DependencyObservable implements styling.Style {
    private _view: View;
    private _updateCounter = 0;
    private _nativeSetters = new Map<Property, any>();

    get color(): Color {
        return this._getValue(colorProperty);
    }
    set color(value: Color) {
        this._setValue(colorProperty, value);
    }

    get backgroundColor(): Color {
        return this._getValue(backgroundColorProperty);
    }
    set backgroundColor(value: Color) {
        this._setValue(backgroundColorProperty, value);
    }

    get backgroundImage(): string {
        return this._getValue(backgroundImageProperty);
    }
    set backgroundImage(value: string) {
        this._setValue(backgroundImageProperty, value);
    }

    get backgroundRepeat(): string {
        return this._getValue(backgroundRepeatProperty);
    }
    set backgroundRepeat(value: string) {
        this._setValue(backgroundRepeatProperty, value);
    }

    get backgroundSize(): string {
        return this._getValue(backgroundSizeProperty);
    }
    set backgroundSize(value: string) {
        this._setValue(backgroundSizeProperty, value);
    }

    get backgroundPosition(): string {
        return this._getValue(backgroundPositionProperty);
    }
    set backgroundPosition(value: string) {
        this._setValue(backgroundPositionProperty, value);
    }

    get borderColor(): Color {
        return this._getValue(borderColorProperty);
    }
    set borderColor(value: Color) {
        this._setValue(borderColorProperty, value);
    }

    get borderWidth(): number {
        return this._getValue(borderWidthProperty);
    }
    set borderWidth(value: number) {
        this._setValue(borderWidthProperty, value);
    }

    get borderRadius(): number {
        return this._getValue(borderRadiusProperty);
    }
    set borderRadius(value: number) {
        this._setValue(borderRadiusProperty, value);
    }

    get fontSize(): number {
        return this._getValue(fontSizeProperty);
    }
    set fontSize(value: number) {
        this._setValue(fontSizeProperty, value);
    }

    get fontFamily(): string {
        return this._getValue(fontFamilyProperty);
    }
    set fontFamily(value: string) {
        this._setValue(fontFamilyProperty, value);
    }

    get fontStyle(): string {
        return this._getValue(fontStyleProperty);
    }
    set fontStyle(value: string) {
        this._setValue(fontStyleProperty, value);
    }

    get fontWeight(): string {
        return this._getValue(fontWeightProperty);
    }
    set fontWeight(value: string) {
        this._setValue(fontWeightProperty, value);
    }

    get font(): string {
        return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
    }
    set font(value: string) {        
        this._setShorthandProperty("font", value);
    }

    get textAlignment(): string {
        return this._getValue(textAlignmentProperty);
    }
    set textAlignment(value: string) {
        this._setValue(textAlignmentProperty, value);
    }

    get minWidth(): number {
        return this._getValue(minWidthProperty);
    }
    set minWidth(value: number) {
        this._setValue(minWidthProperty, value);
    }

    get minHeight(): number {
        return this._getValue(minHeightProperty);
    }
    set minHeight(value: number) {
        this._setValue(minHeightProperty, value);
    }

    get width(): number {
        return this._getValue(widthProperty);
    }
    set width(value: number) {
        this._setValue(widthProperty, value);
    }

    get height(): number {
        return this._getValue(heightProperty);
    }
    set height(value: number) {
        this._setValue(heightProperty, value);
    }

    get margin(): string {
        return this.marginTop + " " + this.marginRight + " " + this.marginBottom + " " + this.marginLeft;
    }
    set margin(value: string) {
        this._setShorthandProperty("margin", value);
    }

    get marginLeft(): number {
        return this._getValue(marginLeftProperty);
    }
    set marginLeft(value: number) {
        this._setValue(marginLeftProperty, value);
    }

    get marginTop(): number {
        return this._getValue(marginTopProperty);
    }
    set marginTop(value: number) {
        this._setValue(marginTopProperty, value);
    }

    get marginRight(): number {
        return this._getValue(marginRightProperty);
    }
    set marginRight(value: number) {
        this._setValue(marginRightProperty, value);
    }

    get marginBottom(): number {
        return this._getValue(marginBottomProperty);
    }
    set marginBottom(value: number) {
        this._setValue(marginBottomProperty, value);
    }

    get padding(): string {
        return this.paddingTop + " " + this.paddingRight + " " + this.paddingBottom + " " + this.paddingLeft;
    }
    set padding(value: string) {
        this._setShorthandProperty("padding", value);
    }

    get paddingLeft(): number {
        return this._getValue(paddingLeftProperty);
    }
    set paddingLeft(value: number) {
        this._setValue(paddingLeftProperty, value);
    }

    get paddingTop(): number {
        return this._getValue(paddingTopProperty);
    }
    set paddingTop(value: number) {
        this._setValue(paddingTopProperty, value);
    }

    get paddingRight(): number {
        return this._getValue(paddingRightProperty);
    }
    set paddingRight(value: number) {
        this._setValue(paddingRightProperty, value);
    }

    get paddingBottom(): number {
        return this._getValue(paddingBottomProperty);
    }
    set paddingBottom(value: number) {
        this._setValue(paddingBottomProperty, value);
    }

    get horizontalAlignment(): string {
        return this._getValue(horizontalAlignmentProperty);
    }
    set horizontalAlignment(value: string) {
        this._setValue(horizontalAlignmentProperty, value);
    }

    get verticalAlignment(): string {
        return this._getValue(verticalAlignmentProperty);
    }
    set verticalAlignment(value: string) {
        this._setValue(verticalAlignmentProperty, value);
    }

    get visibility(): string {
        return this._getValue(visibilityProperty);
    }
    set visibility(value: string) {
        this._setValue(visibilityProperty, value);
    }

    get opacity(): number {
        return this._getValue(opacityProperty);
    }
    set opacity(value: number) {
        this._setValue(opacityProperty, value);
    }

    constructor(parentView: View) {
        super();
        this._view = parentView;
    }

    public _beginUpdate() {
        this._updateCounter++;
    }

    public _endUpdate() {
        this._updateCounter--;
        if (this._updateCounter < 0) {
            throw new Error("style._endUpdate() called, but no update is in progress.");
        }

        if (this._updateCounter === 0) {
            this._nativeSetters.forEach((newValue, property, map) => { this._applyStyleProperty(property, newValue); });
            this._nativeSetters.clear();
        }
    }

    public _resetCssValues() {
        var that = this;
        this._eachSetProperty(function (property: Property) {
            that._resetValue(property, ValueSource.Css);
            return true;
        });
    }

    public _resetLocalValues() {
        var that = this;
        this._eachSetProperty(function (property: Property) {
            that._resetValue(property);
            return true;
        });
    }

    public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
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

    private _applyProperty(property: Property, newValue: any) {
        this._applyStyleProperty(property, newValue);

        // The effective value of an inheritable property has changed 
        // propagate the change down to the descendants to update their inherited properties.
        if (this._view._childrenCount === 0 || !property.metadata.inheritable) {
            return;
        }

        var eachChild = function (child: View): boolean {
            child.style._inheritStyleProperty(property);
            return true;
        }

        this._view._eachChildView(eachChild);
    }

    private _applyStyleProperty(property: Property, newValue: any) {

        if (!this._view._shouldApplyStyleHandlers()) {
            return;
        }

        if (this._updateCounter > 0) {
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

    public _inheritStyleProperty(property: Property) {
        if (!property.metadata.inheritable) {
            throw new Error("An attempt was made to inherit a style property which is not marked as 'inheritable'.");
        }

        var currentParent = this._view.parent;
        var valueSource: number;

        while (currentParent) {
            valueSource = currentParent.style._getValueSource(property);
            if (valueSource > ValueSource.Default) {
                this._setValue(property, currentParent.style._getValue(property), ValueSource.Inherited);
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

    get _nativeView(): any {
        return this._view._nativeView;
    }

    private _setShorthandProperty(name: string, value: any): void {
        var pairs = styleProperty.getShorthandPairs(name, value);
        if (pairs) {
            this._beginUpdate();
            for (let j = 0; j < pairs.length; j++) {
                let pair = pairs[j];
                this._setValue(pair.property, pair.value, ValueSource.Local);
            }
            this._endUpdate();
        }
    }
}

export function registerHandler(property: Property, handler: styling.stylers.StylePropertyChangedHandler, className?: string) {
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

export function getHandler(property: Property, view: View): styling.stylers.StylePropertyChangedHandler {
    return getHandlerInternal(property.id, types.getClassInfo(view));
}

// Property registration
export var colorProperty = new styleProperty.Property("color", "color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var backgroundImageProperty = new styleProperty.Property("backgroundImage", "background-image",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundImagePropertyChanged));

export var backgroundColorProperty = new styleProperty.Property("backgroundColor", "background-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundColorPropertyChanged, Color.isValid, Color.equals), converters.colorConverter);

export var backgroundRepeatProperty = new styleProperty.Property("backgroundRepeat", "background-repeat",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundRepeatPropertyChanged));

export var backgroundSizeProperty = new styleProperty.Property("backgroundSize", "background-size",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundSizePropertyChanged));

export var backgroundPositionProperty = new styleProperty.Property("backgroundPosition", "background-position",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBackgroundPositionPropertyChanged));

export var borderColorProperty = new styleProperty.Property("borderColor", "border-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals), converters.colorConverter);

export var borderWidthProperty = new styleProperty.Property("borderWidth", "border-width",
    new PropertyMetadata(0, AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var borderRadiusProperty = new styleProperty.Property("borderRadius", "border-radius",
    new PropertyMetadata(0, AffectsLayout, null, isPaddingValid), converters.numberConverter);

export var backgroundInternalProperty = new styleProperty.Property("_backgroundInternal", "_backgroundInternal",
    new PropertyMetadata(background.Background.default, PropertyMetadataSettings.None, undefined, undefined, background.Background.equals));

export var fontSizeProperty = new styleProperty.Property("fontSize", "font-size",
    new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontSizeChanged), converters.fontSizeConverter);

export var fontFamilyProperty = new styleProperty.Property("fontFamily", "font-family",
    new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, onFontFamilyChanged));

export var fontStyleProperty = new styleProperty.Property("fontStyle", "font-style",
    new PropertyMetadata(enums.FontStyle.normal, PropertyMetadataSettings.Inheritable, onFontStyleChanged, isFontStyleValid));

export var fontWeightProperty = new styleProperty.Property("fontWeight", "font-weight",
    new PropertyMetadata(enums.FontWeight.normal, PropertyMetadataSettings.Inheritable, onFontWeightChanged, isFontWeightValid));

export var fontInternalProperty = new styleProperty.Property("_fontInternal", "_fontInternal",
    new PropertyMetadata(font.Font.default, AffectsLayout, null, null, font.Font.equals), font.Font.parse);

export var textAlignmentProperty = new styleProperty.Property("textAlignment", "text-align",
    new PropertyMetadata(undefined, AffectsLayout | PropertyMetadataSettings.Inheritable), converters.textAlignConverter);

export var minWidthProperty = new styleProperty.Property("minWidth", "min-width",
    new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), converters.numberConverter);

export var minHeightProperty = new styleProperty.Property("minHeight", "min-height",
    new PropertyMetadata(0, AffectsLayout, null, isMinWidthHeightValid), converters.numberConverter);

export var visibilityProperty = new styleProperty.Property("visibility", "visibility",
    new PropertyMetadata(enums.Visibility.visible, AffectsLayout, onVisibilityChanged, isVisibilityValid), converters.visibilityConverter);

export var opacityProperty = new styleProperty.Property("opacity", "opacity",
    new PropertyMetadata(1.0, PropertyMetadataSettings.None, undefined, isOpacityValid), converters.opacityConverter);

// Helper property holding most layout related properties available in CSS.
// When layout related properties are set in CSS we chache them and send them to the native view in a single call.
export var nativeLayoutParamsProperty = new styleProperty.Property("nativeLayoutParams", "nativeLayoutParams",
    new PropertyMetadata({
        width: -1,
        height: -1,
        leftMargin: 0,
        topMargin: 0,
        rightMargin: 0,
        bottomMargin: 0,
        horizontalAlignment: enums.HorizontalAlignment.stretch,
        verticalAlignment: enums.VerticalAlignment.stretch
    }, null, null, null, layoutParamsComparer));

export var widthProperty = new styleProperty.Property("width", "width",
    new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), converters.numberConverter);

export var heightProperty = new styleProperty.Property("height", "height",
    new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), converters.numberConverter);

export var verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align",
    new PropertyMetadata(enums.VerticalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

export var horizontalAlignmentProperty = new styleProperty.Property("horizontalAlignment", "horizontal-align",
    new PropertyMetadata(enums.HorizontalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

export var marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);

export var marginRightProperty = new styleProperty.Property("marginRight", "margin-right",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);

export var marginTopProperty = new styleProperty.Property("marginTop", "margin-top",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);

export var marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), converters.numberConverter);

function getNativePadding(nativeView: android.view.View, callback: (view: android.view.View) => number): NativeValueResult {
    return {
        result: nativeView ? callback(nativeView) / utils.layout.getDisplayDensity() : 0,
        cacheable: !!nativeView
    };
}

function getNativePaddingLeft(instance: DependencyObservable): NativeValueResult {
    var nativeView: android.view.View = (<any>instance)._nativeView;
    return getNativePadding(nativeView, (view) => { return view.getPaddingLeft(); });
}

function getNativePaddingTop(instance: DependencyObservable): NativeValueResult {
    var nativeView: android.view.View = (<any>instance)._nativeView;
    return getNativePadding(nativeView, (view) => { return view.getPaddingTop(); });
}

function getNativePaddingRight(instance: DependencyObservable): NativeValueResult {
    var nativeView: android.view.View = (<any>instance)._nativeView;
    return getNativePadding(nativeView, (view) => { return view.getPaddingRight(); });
}

function getNativePaddingBottom(instance: DependencyObservable): NativeValueResult {
    var nativeView: android.view.View = (<any>instance)._nativeView;
    return getNativePadding(nativeView, (view) => { return view.getPaddingBottom(); });
}

// Helper property holding all paddings. When paddings are set through CSS we cache them and send them to the native view in a single call.
export var nativePaddingsProperty = new styleProperty.Property("paddingNative", "paddingNative",
    new PropertyMetadata(undefined, null, null, null, thicknessComparer));

// TODO: separate into .android/.ios files so that there is no need for such checks
var defaultPadding = global.android ? undefined : 0;

export var paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);

export var paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);

export var paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);

export var paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isPaddingValid), converters.numberConverter);

// TODO: separate into .android/.ios files so that there is no need for such checks
if (global.android) {
    paddingTopProperty.defaultValueGetter = getNativePaddingTop;
    paddingLeftProperty.defaultValueGetter = getNativePaddingLeft;
    paddingRightProperty.defaultValueGetter = getNativePaddingRight;
    paddingBottomProperty.defaultValueGetter = getNativePaddingBottom;
}

function onPaddingChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var thickness = parseThickness(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: paddingTopProperty, value: thickness.top });
    array.push({ property: paddingRightProperty, value: thickness.right });
    array.push({ property: paddingBottomProperty, value: thickness.bottom });
    array.push({ property: paddingLeftProperty, value: thickness.left });
    return array;
}

function onMarginChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var thickness = parseThickness(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: marginTopProperty, value: thickness.top });
    array.push({ property: marginRightProperty, value: thickness.right });
    array.push({ property: marginBottomProperty, value: thickness.bottom });
    array.push({ property: marginLeftProperty, value: thickness.left });
    return array;
}

function onFontChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var newFont = font.Font.parse(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: fontFamilyProperty, value: newFont.fontFamily });
    array.push({ property: fontStyleProperty, value: newFont.fontStyle });
    array.push({ property: fontWeightProperty, value: newFont.fontWeight });
    array.push({ property: fontSizeProperty, value: newFont.fontSize });
    return array;
}

// register default shorthand callbacks.
styleProperty.registerShorthandCallback("font", onFontChanged);
styleProperty.registerShorthandCallback("margin", onMarginChanged);
styleProperty.registerShorthandCallback("padding", onPaddingChanged);

// register default stylers once all properties are defined.
stylers._registerDefaultStylers();
