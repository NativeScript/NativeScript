import application = require("application");
import styling = require("ui/styling");
import types = require("utils/types");
import trace = require("trace");
import {DependencyObservable, PropertyMetadata, PropertyMetadataSettings, PropertyChangeData, Property, ValueSource, NativeValueResult} from "ui/core/dependency-observable";
import {View} from "ui/core/view";
import {Color} from "color";
import styleProperty = require("ui/styling/style-property");
import converters = require("./converters");
import enums = require("ui/enums");
import utils = require("utils/utils");
import font = require("ui/styling/font");
import background = require("ui/styling/background");
import platform = require("platform");
import definition = require("ui/styling/style");
import * as imageSourceModule from "image-source";

var imageSource: typeof imageSourceModule;
function ensureImageSource() {
    if (!imageSource) {
        imageSource = require("image-source");
    }
}

// key is the property id and value is Dictionary<string, StylePropertyChangedHandler>;
var _registeredHandlers = Array<Object>();

// key is a className + property id and value is StylePropertyChangedHandler;
var _handlersCache = {};

// classes like Frame that does not need to handle styling properties.
var noStylingClasses = {};

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

interface ThicknessValue {
    left: Object;
    top: Object;
    right: Object;
    bottom: Object;
}

interface PercentHelper {
    value: number;
    isPercent: boolean;
    isError: boolean;
}

function parseMargin(value: any): ThicknessValue {
    if (types.isString(value)) {
        let arr = (<string>value).split(/[ ,]+/);

        let top: Object;
        let right: Object;
        let bottom: Object;
        let left: Object;

        if (arr.length === 1) {
            top = right = bottom = left = arr[0];
        }
        else if (arr.length === 2) {
            top = bottom = arr[0];
            right = left = arr[1];
        }
        else if (arr.length === 3) {
            top = arr[0];
            right = left = arr[1];
            bottom = arr[2];
        }
        else if (arr.length === 4) {
            top = arr[0];
            right = arr[1];
            bottom = arr[2];
            left = arr[3];
        }
        else {
            throw new Error("Invalid value for margin: " + value);
        }

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        }
    }
    else if (types.isNumber(value)) {
        return {
            top: value,
            right: value,
            bottom: value,
            left: value
        }
    }
    else {
        return value;
    }
}

function layoutParamsComparer(x: definition.CommonLayoutParams, y: definition.CommonLayoutParams): boolean {
    return x.width === y.width
        && x.height === y.height
        && x.leftMargin === y.leftMargin
        && x.topMargin === y.topMargin
        && x.rightMargin === y.rightMargin
        && x.bottomMargin === y.bottomMargin
        && x.horizontalAlignment === y.horizontalAlignment
        && x.verticalAlignment === y.verticalAlignment
        && x.widthPercent === y.widthPercent
        && x.heightPercent === y.heightPercent
        && x.leftMarginPercent === y.leftMarginPercent
        && x.topMarginPercent === y.topMarginPercent
        && x.rightMarginPercent === y.rightMarginPercent
        && x.bottomMarginPercent === y.bottomMarginPercent
}

function onLayoutParamsChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let widthValue = convertToPercentHelper(style.width);

    let width: number;
    let widthPercent: number;
    if (widthValue.isPercent) {
        width = style.horizontalAlignment === enums.HorizontalAlignment.stretch ? -1 : -2;
        widthPercent = widthValue.value / 100;
    }
    else {
        width = isNaN(widthValue.value) ? -1 : widthValue.value;
        widthPercent = -1;
    }

    let heightValue = convertToPercentHelper(style.height);
    let height: number;
    let heightPercent: number;
    if (heightValue.isPercent) {
        height = style.verticalAlignment === enums.VerticalAlignment.stretch ? -1 : -2;
        heightPercent = heightValue.value / 100;
    }
    else {
        height = isNaN(heightValue.value) ? -1 : heightValue.value;
        heightPercent = -1;
    }

    let marginLeftValue = convertToPercentHelper(style.marginLeft);
    let marginTopValue = convertToPercentHelper(style.marginTop);
    let marginRightValue = convertToPercentHelper(style.marginRight);
    let marginBottomValue = convertToPercentHelper(style.marginBottom);

    // Negative marginPercent means no marginPercent so native layout won't override margin with this % value.
    var layoutParams: definition.CommonLayoutParams =
        {
            width: width,
            height: height,
            widthPercent: widthPercent,
            heightPercent: heightPercent,
            leftMargin: marginLeftValue.isPercent ? 0 : marginLeftValue.value,
            leftMarginPercent: marginLeftValue.isPercent ? marginLeftValue.value / 100 : -1,
            topMargin: marginTopValue.isPercent ? 0 : marginTopValue.value,
            topMarginPercent: marginTopValue.isPercent ? marginTopValue.value / 100 : -1,
            rightMargin: marginRightValue.isPercent ? 0 : marginRightValue.value,
            rightMarginPercent: marginRightValue.isPercent ? marginRightValue.value / 100 : -1,
            bottomMargin: marginBottomValue.isPercent ? 0 : marginBottomValue.value,
            bottomMarginPercent: marginBottomValue.isPercent ? marginBottomValue.value / 100 : -1,
            horizontalAlignment: style.horizontalAlignment,
            verticalAlignment: style.verticalAlignment
        };

    style._setValue(nativeLayoutParamsProperty, layoutParams);
}

function onPaddingValueChanged(data: PropertyChangeData) {
    var style = <Style>data.object;
    var thickness: definition.Thickness = {
        top: style.paddingTop,
        right: style.paddingRight,
        bottom: style.paddingBottom,
        left: style.paddingLeft
    };

    style._setValue(nativePaddingsProperty, thickness);
}

function thicknessComparer(x: definition.Thickness, y: definition.Thickness): boolean {
    if (x && y) {
        return x.left === y.left && x.top === y.top && x.right === y.right && x.bottom === y.bottom;
    }
    return !x === !y;
}

function convertToPercentHelper(value: Object): PercentHelper {
    let numberValue = 0;
    let isPercent = false;
    let isError = true;

    if (types.isString(value)) {
        var stringValue = (<string>value).trim();
        var percentIndex = stringValue.indexOf("%");
        if (percentIndex !== -1) {
            // if only % or % is not last we treat it as invalid value.
            if (percentIndex !== (stringValue.length - 1) || percentIndex === 0) {
                numberValue = 0;
            }
            else {
                isPercent = true;
                numberValue = converters.numberConverter(stringValue.substring(0, stringValue.length - 1).trim());
                isError = numberValue === 0;
            }
        }
        else {
            isError = false;
            isPercent = false;
            numberValue = converters.numberConverter(stringValue);
        }
    }
    else if (types.isNumber(value)) {
        isError = false;
        isPercent = false;
        numberValue = <number>value;
    }

    return {
        isError: isError,
        isPercent: isPercent,
        value: numberValue
    }
}

function numberOrPercentConverter(value: Object) {
    let result = convertToPercentHelper(value);
    if (result.isError) {
        throw new Error("Invalid value: " + value);
    }
    return result.isPercent ? value : result.value;
}

function isWidthHeightValid(value: Object): boolean {
    var result = convertToPercentHelper(value);
    if (result.isError) {
        return false;
    }

    return isNaN(result.value) || (result.value >= 0.0 && isFinite(result.value));
}

function isMinWidthHeightValid(value: number): boolean {
    return !isNaN(value) && value >= 0.0 && isFinite(value);
}

function getHandlerInternal(propertyId: number, classInfo: types.ClassInfo): definition.StylePropertyChangedHandler {
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

function isTextDecorationValid(value: string): boolean {
    var values = (value + "").split(" ");

    return values.indexOf(enums.TextDecoration.none) !== -1 || values.indexOf(enums.TextDecoration.underline) !== -1 || values.indexOf(enums.TextDecoration.lineThrough) !== -1;
}

function isTextTransformValid(value: string): boolean {
    return value === enums.TextTransform.none || value === enums.TextTransform.uppercase || value === enums.TextTransform.lowercase || value === enums.TextTransform.capitalize;
}

function isWhiteSpaceValid(value: string): boolean {
    return value === enums.WhiteSpace.nowrap || value === enums.WhiteSpace.normal;
}

function isNonNegativeFiniteNumber(value: number): boolean {
    return isFinite(value) && !isNaN(value) && value >= 0;
}

var supportedPaths = ["rect", "circle", "ellipse", "polygon", "inset"];
function isClipPathValid(value: string): boolean {
    if (!value) {
        return true;
    }
    var functionName = value.substring(0, value.indexOf("(")).trim();
    return supportedPaths.indexOf(functionName) !== -1;
}

function isMarginValid(value: number): boolean {
    var result = convertToPercentHelper(value);
    if (result.isError) {
        return false;
    }

    return isFinite(result.value) && !isNaN(result.value);
}

function isOpacityValid(value: string): boolean {
    var parsedValue: number = parseFloat(value);
    return !isNaN(parsedValue) && 0 <= parsedValue && parsedValue <= 1;
}

function isFloatValueValid(value: string): boolean {
    var parsedValue: number = parseFloat(value);
    return !isNaN(parsedValue);
}

function isFontWeightValid(value: string): boolean {
    if (!value) {
        console.trace();
    }
    return value === enums.FontWeight.thin
        || value === enums.FontWeight.extraLight
        || value === enums.FontWeight.light
        || value === enums.FontWeight.normal || value === "400"
        || value === enums.FontWeight.medium
        || value === enums.FontWeight.semiBold
        || value === enums.FontWeight.bold || value === "700"
        || value === enums.FontWeight.extraBold
        || value === enums.FontWeight.black
        ;
}

function isFontStyleValid(value: string): boolean {
    return value === enums.FontStyle.normal || value === enums.FontStyle.italic;
}

function onVisibilityChanged(data: PropertyChangeData) {
    (<any>data.object)._view._isVisibleCache = data.newValue === enums.Visibility.visible;
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

    get rotate(): number {
        return this._getValue(rotateProperty);
    }

    set rotate(value: number) {
        this._setValue(rotateProperty, value);
    }

    get scaleX(): number {
        return this._getValue(scaleXProperty);
    }

    set scaleX(value: number) {
        this._setValue(scaleXProperty, value);
    }

    get scaleY(): number {
        return this._getValue(scaleYProperty);
    }

    set scaleY(value: number) {
        this._setValue(scaleYProperty, value);
    }

    get translateX(): number {
        return this._getValue(translateXProperty);
    }

    set translateX(value: number) {
        this._setValue(translateXProperty, value);
    }

    get translateY(): number {
        return this._getValue(translateYProperty);
    }

    set translateY(value: number) {
        this._setValue(translateYProperty, value);
    }

    get color(): Color {
        return this._getValue(colorProperty);
    }
    set color(value: Color) {
        this._setValue(colorProperty, value);
    }

    get tintColor(): Color {
        return this._getValue(tintColorProperty);
    }
    set tintColor(value: Color) {
        this._setValue(tintColorProperty, value);
    }

    get placeholderColor(): Color {
        return this._getValue(placeholderColorProperty);
    }
    set placeholderColor(value: Color) {
        this._setValue(placeholderColorProperty, value);
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

    get borderColor(): string | Color {
        if (Color.equals(this.borderTopColor, this.borderRightColor) &&
            Color.equals(this.borderTopColor, this.borderBottomColor) &&
            Color.equals(this.borderTopColor, this.borderLeftColor)){
            return this.borderTopColor;
        }
        else {
            return `${this.borderTopColor} ${this.borderRightColor} ${this.borderBottomColor} ${this.borderLeftColor}`;
        }
    }
    set borderColor(value: string | Color) {
        if (value instanceof Color){
            value = (<Color>value).hex;
        }
        this._setShorthandProperty("border-color", value);
        }

    get borderTopColor(): Color {
        return this._getValue(borderTopColorProperty);
    }
    set borderTopColor(value: Color) {
        this._setValue(borderTopColorProperty, value);
    }

    get borderRightColor(): Color {
        return this._getValue(borderRightColorProperty);
    }
    set borderRightColor(value: Color) {
        this._setValue(borderRightColorProperty, value);
    }

    get borderBottomColor(): Color {
        return this._getValue(borderBottomColorProperty);
    }
    set borderBottomColor(value: Color) {
        this._setValue(borderBottomColorProperty, value);
    }

    get borderLeftColor(): Color {
        return this._getValue(borderLeftColorProperty);
    }
    set borderLeftColor(value: Color) {
        this._setValue(borderLeftColorProperty, value);
    }

    get borderWidth(): string | number {
        if (this.borderTopWidth === this.borderRightWidth &&
            this.borderTopWidth === this.borderBottomWidth &&
            this.borderTopWidth === this.borderLeftWidth){
                return this.borderTopWidth;
        }
        else {
            return `${this.borderTopWidth} ${this.borderRightWidth} ${this.borderBottomWidth} ${this.borderLeftWidth}`;
        }
    }
    set borderWidth(value: string | number) {
        this._setShorthandProperty("border-width", value.toString());
        }

    get borderTopWidth(): number {
        return this._getValue(borderTopWidthProperty);
    }
    set borderTopWidth(value: number) {
        this._setValue(borderTopWidthProperty, value);
    }

    get borderRightWidth(): number {
        return this._getValue(borderRightWidthProperty);
    }
    set borderRightWidth(value: number) {
        this._setValue(borderRightWidthProperty, value);
    }

    get borderBottomWidth(): number {
        return this._getValue(borderBottomWidthProperty);
    }
    set borderBottomWidth(value: number) {
        this._setValue(borderBottomWidthProperty, value);
    }

    get borderLeftWidth(): number {
        return this._getValue(borderLeftWidthProperty);
    }
    set borderLeftWidth(value: number) {
        this._setValue(borderLeftWidthProperty, value);
    }

    get borderRadius(): string | number {
        if (this.borderTopLeftRadius === this.borderTopRightRadius &&
            this.borderTopLeftRadius === this.borderBottomRightRadius &&
            this.borderTopLeftRadius === this.borderBottomLeftRadius){
                return this.borderTopLeftRadius;
        }
        else {
            return `${this.borderTopLeftRadius} ${this.borderTopRightRadius} ${this.borderBottomRightRadius} ${this.borderBottomLeftRadius}`;
        }
    }
    set borderRadius(value: string | number) {
        this._setShorthandProperty("border-radius", value.toString());
        }

    get borderTopLeftRadius(): number {
        return this._getValue(borderTopLeftRadiusProperty);
    }
    set borderTopLeftRadius(value: number) {
        this._setValue(borderTopLeftRadiusProperty, value);
    }

    get borderTopRightRadius(): number {
        return this._getValue(borderTopRightRadiusProperty);
    }
    set borderTopRightRadius(value: number) {
        this._setValue(borderTopRightRadiusProperty, value);
    }

    get borderBottomRightRadius(): number {
        return this._getValue(borderBottomRightRadiusProperty);
    }
    set borderBottomRightRadius(value: number) {
        this._setValue(borderBottomRightRadiusProperty, value);
    }

    get borderBottomLeftRadius(): number {
        return this._getValue(borderBottomLeftRadiusProperty);
    }
    set borderBottomLeftRadius(value: number) {
        this._setValue(borderBottomLeftRadiusProperty, value);
    }

    get clipPath(): string {
        return this._getValue(clipPathProperty);
    }
    set clipPath(value: string) {
        this._setValue(clipPathProperty, value);
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
        let stringValue = value ? value.toString() : undefined;
        this._setValue(fontWeightProperty, stringValue);
    }

    get font(): string {
        return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
    }
    set font(value: string) {
        this._setShorthandProperty("font", value);
    }

    get _fontInternal(): font.Font {
        return this._getValue(fontInternalProperty);
    }
    set _fontInternal(value: font.Font) {
        this._setValue(fontInternalProperty, value);
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

    get textDecoration(): string {
        return this._getValue(textDecorationProperty);
    }
    set textDecoration(value: string) {
        this._setValue(textDecorationProperty, value);
    }

    get textTransform(): string {
        return this._getValue(textTransformProperty);
    }
    set textTransform(value: string) {
        this._setValue(textTransformProperty, value);
    }

    get whiteSpace(): string {
        return this._getValue(whiteSpaceProperty);
    }
    set whiteSpace(value: string) {
        this._setValue(whiteSpaceProperty, value);
    }

    get letterSpacing(): number {
        return this._getValue(letterSpacingProperty);
    }
    set letterSpacing(value: number) {
        this._setValue(letterSpacingProperty, value);
    }

    get zIndex(): number {
        return this._getValue(zIndexProperty);
    }
    set zIndex(value: number) {
        this._setValue(zIndexProperty, value);
    }

    // Page-specific properties
    get statusBarStyle(): string {
        return this._getValue(statusBarStyleProperty);
    }
    set statusBarStyle(value: string) {
        this._setValue(statusBarStyleProperty, value);
    }
    
    get androidStatusBarBackground(): Color {
        return this._getValue(androidStatusBarBackgroundProperty);
    }
    set androidStatusBarBackground(value: Color) {
        this._setValue(androidStatusBarBackgroundProperty, value);
    }

    // TabView-specific properties
    get tabTextColor(): Color {
        return this._getValue(tabTextColorProperty);
    }
    set tabTextColor(value: Color) {
        this._setValue(tabTextColorProperty, value);
    }

    get tabBackgroundColor(): Color {
        return this._getValue(tabBackgroundColorProperty);
    }
    set tabBackgroundColor(value: Color) {
        this._setValue(tabBackgroundColorProperty, value);
    }

    get selectedTabTextColor(): Color {
        return this._getValue(selectedTabTextColorProperty);
    }
    set selectedTabTextColor(value: Color) {
        this._setValue(selectedTabTextColorProperty, value);
    }

    get androidSelectedTabHighlightColor(): Color {
        return this._getValue(androidSelectedTabHighlightColorProperty);
    }
    set androidSelectedTabHighlightColor(value: Color) {
        this._setValue(androidSelectedTabHighlightColorProperty, value);
    }

    get selectedBackgroundColor(): Color {
        return this._getValue(selectedBackgroundColorProperty);
    }
    set selectedBackgroundColor(value: Color) {
        this._setValue(selectedBackgroundColorProperty, value);
    }

    public _updateTextDecoration() {
        if (this._getValue(textDecorationProperty) !== enums.TextDecoration.none) {
            this._applyProperty(textDecorationProperty, this._getValue(textDecorationProperty));
        }
    }

    public _updateTextTransform() {
        if (this._getValue(textTransformProperty) !== enums.TextTransform.none) {
            this._applyProperty(textTransformProperty, this._getValue(textTransformProperty));
        }
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
        this._view._unregisterAllAnimations();
        this._resetValues(ValueSource.Css);
    }

    public _resetLocalValues() {
        this._resetValues(ValueSource.Local);
    }

    public _inheritStyleProperties(parent: View) {
        parent.style._eachSetPropertyValue((property, value) => {
            if (property.inheritable) {
                // this._inheritStyleProperty(property, value);
                this._setValue(property, value, ValueSource.Inherited);
            }

            return true;
        });
    }

    public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
        if (trace.enabled) {
            trace.write(
                "Style._onPropertyChanged view:" + this._view +
                ", property: " + property.name +
                ", oldValue: " + oldValue +
                ", newValue: " + newValue, trace.categories.Style);
        }

        super._onPropertyChanged(property, oldValue, newValue);

        this._view._checkMetadataOnPropertyChanged(property.metadata);

        this._applyProperty(property, newValue);
    }

    public _sizeChanged() {
        if (!(<background.Background>this._getValue(backgroundInternalProperty)).isEmpty()) {
            this._applyStyleProperty(backgroundInternalProperty, this._getValue(backgroundInternalProperty));
        }

        var clipPathPropertyValue = this._getValue(clipPathProperty);
        if (types.isString(clipPathPropertyValue) && clipPathPropertyValue !== "") {
            this._applyStyleProperty(clipPathProperty, clipPathPropertyValue);
        }
    }

    public _syncNativeProperties() {
        this._eachSetPropertyValue((property, value) => {
            this._applyStyleProperty(property, value);
            return true;
        });
    }

    private _applyProperty(property: Property, newValue: any) {
        this._applyStyleProperty(property, newValue);

        // The effective value of an inheritable property has changed
        // propagate the change down to the descendants to update their inherited properties.
        if (property.inheritable && this._view._childrenCount > 0) {
            this._view._eachChildView((child: View) => {
                // child.style._inheritStyleProperty(property);
                child.style._setValue(property, newValue, ValueSource.Inherited);
                return true;
            });
        }
    }

    private _applyStyleProperty(property: Property, newValue: any) {
        if (!this._view._shouldApplyStyleHandlers()) {
            return;
        }

        if (this._updateCounter > 0) {
            this._nativeSetters.set(property, newValue);
            return;
        }

        let handler: definition.StylePropertyChangedHandler = getHandler(property, this._view);
        if (!handler) {
            if (trace.enabled) {
                trace.write("No handler for property: " + property.name + " with id: " + property.id + ", view:" + this._view, trace.categories.Style);
            }
        }
        else {
            if (trace.enabled) {
                trace.write("Found handler for property: " + property.name + ", view:" + this._view, trace.categories.Style);
            }

            let shouldReset = false;
            if (property.equalityComparer) {
                shouldReset = property.equalityComparer(newValue, property.defaultValue);
            }
            else {
                shouldReset = (newValue === property.defaultValue);
            }

            if (shouldReset) {
                (<any>handler).resetProperty(property, this._view);
            } else {
                (<any>handler).applyProperty(property, this._view, newValue);
            }

            this._view._onStylePropertyChanged(property);
        }
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

export function registerHandler(property: Property, handler: definition.StylePropertyChangedHandler, className?: string) {
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

export function getHandler(property: Property, view: View): definition.StylePropertyChangedHandler {
    return getHandlerInternal(property.id, types.getClassInfo(view));
}

// Property registration

export var rotateProperty = new styleProperty.Property("rotate", "rotate",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var scaleXProperty = new styleProperty.Property("scaleX", "scaleX",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var scaleYProperty = new styleProperty.Property("scaleY", "scaleY",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var translateXProperty = new styleProperty.Property("translateX", "translateX",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var translateYProperty = new styleProperty.Property("translateY", "translateY",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, null));

export var colorProperty = new styleProperty.Property("color", "color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var tintColorProperty = new styleProperty.Property("tintColor", "tint-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.Inheritable, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var placeholderColorProperty = new styleProperty.Property("placeholderColor", "placeholder-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

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

export var textDecorationProperty = new styleProperty.Property("textDecoration", "text-decoration",
    new PropertyMetadata(enums.TextDecoration.none, PropertyMetadataSettings.None, undefined, isTextDecorationValid), converters.textDecorationConverter);

export var textTransformProperty = new styleProperty.Property("textTransform", "text-transform",
    new PropertyMetadata(enums.TextTransform.none, PropertyMetadataSettings.None, undefined, isTextTransformValid), converters.textTransformConverter);

export var whiteSpaceProperty = new styleProperty.Property("whiteSpace", "white-space",
    new PropertyMetadata(undefined, AffectsLayout, undefined, isWhiteSpaceValid), converters.whiteSpaceConverter);

export var letterSpacingProperty = new styleProperty.Property("letterSpacing", "letter-spacing",
    new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), converters.floatConverter);

export var zIndexProperty = new styleProperty.Property("zIndex", "z-index",
    new PropertyMetadata(Number.NaN, AffectsLayout, undefined, isFloatValueValid), converters.floatConverter);

//TabView-specific props
export var tabTextColorProperty = new styleProperty.Property("tabTextColor", "tab-text-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var tabBackgroundColorProperty = new styleProperty.Property("tabBackgroundColor", "tab-background-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var selectedTabTextColorProperty = new styleProperty.Property("selectedTabTextColor", "selected-tab-text-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

export var androidSelectedTabHighlightColorProperty = new styleProperty.Property("androidSelectedTabHighlightColor", "android-selected-tab-highlight-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

//Page-specific props
export var statusBarStyleProperty = new styleProperty.Property("statusBarStyle", "status-bar-style",
    new PropertyMetadata(undefined));

export var androidStatusBarBackgroundProperty = new styleProperty.Property("androidStatusBarBackground", "android-status-bar-background",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

// SegmentedBar-specific props
export var selectedBackgroundColorProperty = new styleProperty.Property("selectedBackgroundColor", "selected-background-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, undefined, Color.isValid, Color.equals),
    converters.colorConverter);

// Helper property holding most layout related properties available in CSS.
// When layout related properties are set in CSS we chache them and send them to the native view in a single call.
export var nativeLayoutParamsProperty = new styleProperty.Property("nativeLayoutParams", "nativeLayoutParams",
    new PropertyMetadata({
        width: -1,
        widthPercent: -1,
        height: -1,
        heightPercent: -1,
        leftMargin: 0,
        leftMarginPercent: -1,
        topMargin: 0,
        topMarginPercent: -1,
        rightMargin: 0,
        rightMarginPercent: -1,
        bottomMargin: 0,
        bottomMarginPercent: -1,
        horizontalAlignment: enums.HorizontalAlignment.stretch,
        verticalAlignment: enums.VerticalAlignment.stretch
    }, null, null, null, layoutParamsComparer));

export var widthProperty = new styleProperty.Property("width", "width",
    new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export var heightProperty = new styleProperty.Property("height", "height",
    new PropertyMetadata(Number.NaN, AffectsLayout, onLayoutParamsChanged, isWidthHeightValid), numberOrPercentConverter);

export var marginLeftProperty = new styleProperty.Property("marginLeft", "margin-left",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export var marginRightProperty = new styleProperty.Property("marginRight", "margin-right",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export var marginTopProperty = new styleProperty.Property("marginTop", "margin-top",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export var marginBottomProperty = new styleProperty.Property("marginBottom", "margin-bottom",
    new PropertyMetadata(0, AffectsLayout, onLayoutParamsChanged, isMarginValid), numberOrPercentConverter);

export var verticalAlignmentProperty = new styleProperty.Property("verticalAlignment", "vertical-align",
    new PropertyMetadata(enums.VerticalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

export var horizontalAlignmentProperty = new styleProperty.Property("horizontalAlignment", "horizontal-align",
    new PropertyMetadata(enums.HorizontalAlignment.stretch, AffectsLayout, onLayoutParamsChanged));

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
var defaultPadding = platform.isAndroid ? undefined : 0;

export var paddingLeftProperty = new styleProperty.Property("paddingLeft", "padding-left",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var paddingRightProperty = new styleProperty.Property("paddingRight", "padding-right",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var paddingTopProperty = new styleProperty.Property("paddingTop", "padding-top",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var paddingBottomProperty = new styleProperty.Property("paddingBottom", "padding-bottom",
    new PropertyMetadata(defaultPadding, AffectsLayout, onPaddingValueChanged, isNonNegativeFiniteNumber), converters.numberConverter);

// TODO: separate into .android/.ios files so that there is no need for such checks
if (platform.device.os === platform.platformNames.android) {
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
    var thickness = parseMargin(value);
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

function onTransformChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var newTransform = converters.transformConverter(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    var values = undefined;
    for (var transform in newTransform) {
        switch (transform) {
            case "scaleX":
                array.push({ property: scaleXProperty, value: parseFloat(newTransform[transform]) });
                break;
            case "scaleY":
                array.push({ property: scaleYProperty, value: parseFloat(newTransform[transform]) });
                break;
            case "scale":
            case "scale3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push({ property: scaleXProperty, value: parseFloat(values[0]) });
                    array.push({ property: scaleYProperty, value: parseFloat(values[1]) });
                }
                else if (values.length === 1) {
                    array.push({ property: scaleXProperty, value: parseFloat(values[0]) });
                    array.push({ property: scaleYProperty, value: parseFloat(values[0]) });
                }
                break;
            case "translateX":
                array.push({ property: translateXProperty, value: parseFloat(newTransform[transform]) });
                break;
            case "translateY":
                array.push({ property: translateYProperty, value: parseFloat(newTransform[transform]) });
                break;
            case "translate":
            case "translate3d":
                values = newTransform[transform].split(",");
                if (values.length >= 2) {
                    array.push({ property: translateXProperty, value: parseFloat(values[0]) });
                    array.push({ property: translateYProperty, value: parseFloat(values[1]) });
                }
                else if (values.length === 1) {
                    array.push({ property: translateXProperty, value: parseFloat(values[0]) });
                    array.push({ property: translateYProperty, value: parseFloat(values[0]) });
                }
                break;
            case "rotate":
                let text = newTransform[transform];
                let val = parseFloat(text);
                if (text.slice(-3) === "rad") {
                    val = val * (180.0 / Math.PI);
                }
                array.push({ property: rotateProperty, value: val });
                break;
            case "none":
                array.push({ property: scaleXProperty, value: 1 });
                array.push({ property: scaleYProperty, value: 1 });
                array.push({ property: translateXProperty, value: 0 });
                array.push({ property: translateYProperty, value: 0 });
                array.push({ property: rotateProperty, value: 0 });
                break;
        }
    }
    return array;
}

// register default shorthand callbacks.
styleProperty.registerShorthandCallback("font", onFontChanged);
styleProperty.registerShorthandCallback("margin", onMarginChanged);
styleProperty.registerShorthandCallback("padding", onPaddingChanged);
styleProperty.registerShorthandCallback("transform", onTransformChanged);

var _defaultNativeValuesCache = {};

export class StylePropertyChangedHandler {
    private _applyProperty: (view: View, newValue: any, defaultValue?: any) => void;
    private _resetProperty: (view: View, nativeValue: any) => void;
    private _getNativeValue: (view: View) => any;

    constructor(
        applyCallback: (view: View, newValue: any, defaultValue?: any) => void,
        resetCallback: (view: View, nativeValue: any) => void,
        getNativeValue?: (view: View) => any) {

        this._applyProperty = applyCallback;
        this._resetProperty = resetCallback;
        this._getNativeValue = getNativeValue;
    }

    public applyProperty(property: Property, view: View, newValue: any) {
        var className = types.getClass(view);
        if (!_defaultNativeValuesCache.hasOwnProperty(className + property.id) && this._getNativeValue) {
            _defaultNativeValuesCache[className + property.id] = this._getNativeValue(view);
        }

        if (application.android) {
            newValue = newValue.android ? newValue.android : newValue;
        } else if (application.ios) {
            newValue = newValue.ios ? newValue.ios : newValue;
        }

        this._applyProperty(view, newValue, _defaultNativeValuesCache[className + property.id]);
    }

    public resetProperty(property: Property, view: View) {
        var className = types.getClass(view);
        this._resetProperty(view, _defaultNativeValuesCache[className + property.id]);
    }
}

export var ignorePropertyHandler = new StylePropertyChangedHandler(
    (view, val) => {
        // empty
    },
    (view, val) => {
        // empty
    });

registerNoStylingClass("Frame");

function onBackgroundColorPropertyChanged(data: PropertyChangeData) {
        var style = <Style>data.object;
        var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (!Color.equals(currentBackground.color, data.newValue)) {
        style._setValue(backgroundInternalProperty, currentBackground.withColor(data.newValue));
        }
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

        ensureImageSource();

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
                    // Get the current background again, as it might have changed while doing the request.
                    currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
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

function onBackgroundSizePropertyChanged(data: PropertyChangeData) {
        var style = <Style>data.object;
        var currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.size) {
        style._setValue(backgroundInternalProperty, currentBackground.withSize(data.newValue));
        }
    }

function onBorderTopColorPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderTopColor) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderTopColor(data.newValue));
}
}

function onBorderRightColorPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderRightColor) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderRightColor(data.newValue));
    }
}

function onBorderBottomColorPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderBottomColor) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderBottomColor(data.newValue));
    }
}

function onBorderLeftColorPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderLeftColor) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderLeftColor(data.newValue));
    }
}

function onBorderTopWidthPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderTopWidth) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderTopWidth(data.newValue));
    }
}

function onBorderRightWidthPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderRightWidth) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderRightWidth(data.newValue));
    }
}

function onBorderBottomWidthPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderBottomWidth) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderBottomWidth(data.newValue));
    }
}

function onBorderLeftWidthPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderLeftWidth) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderLeftWidth(data.newValue));
    }
}

function onBorderTopLeftRadiusPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderTopLeftRadius) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderTopLeftRadius(data.newValue));
    }
}

function onBorderTopRightRadiusPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderTopRightRadius) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderTopRightRadius(data.newValue));
    }
}

function onBorderBottomRightRadiusPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderBottomRightRadius) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderBottomRightRadius(data.newValue));
    }
}

function onBorderBottomLeftRadiusPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.borderBottomLeftRadius) {
        style._setValue(backgroundInternalProperty, currentBackground.withBorderBottomLeftRadius(data.newValue));
    }
        }

function onClipPathPropertyChanged(data: PropertyChangeData) {
    let style = <Style>data.object;
    let currentBackground = <background.Background>style._getValue(backgroundInternalProperty);
    if (data.newValue !== currentBackground.clipPath) {
        style._setValue(backgroundInternalProperty, currentBackground.withClipPath(data.newValue));
    }
}

export var backgroundInternalProperty = new styleProperty.Property("_backgroundInternal", "_backgroundInternal",
    new PropertyMetadata(background.Background.default, PropertyMetadataSettings.None, undefined, undefined, background.Background.equals));

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

export var borderTopColorProperty = new styleProperty.Property("borderTopColor", "border-top-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderTopColorPropertyChanged, Color.isValid, Color.equals), converters.colorConverter);

export var borderRightColorProperty = new styleProperty.Property("borderRightColor", "border-right-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderRightColorPropertyChanged, Color.isValid, Color.equals), converters.colorConverter);

export var borderBottomColorProperty = new styleProperty.Property("borderBottomColor", "border-bottom-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderBottomColorPropertyChanged, Color.isValid, Color.equals), converters.colorConverter);

export var borderLeftColorProperty = new styleProperty.Property("borderLeftColor", "border-left-color",
    new PropertyMetadata(undefined, PropertyMetadataSettings.None, onBorderLeftColorPropertyChanged, Color.isValid, Color.equals), converters.colorConverter);

export var borderTopWidthProperty = new styleProperty.Property("borderTopWidth", "border-top-width",
     new PropertyMetadata(0, AffectsLayout, onBorderTopWidthPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderRightWidthProperty = new styleProperty.Property("borderRightWidth", "border-right-width",
     new PropertyMetadata(0, AffectsLayout, onBorderRightWidthPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderBottomWidthProperty = new styleProperty.Property("borderBottomWidth", "border-bottom-width",
     new PropertyMetadata(0, AffectsLayout, onBorderBottomWidthPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderLeftWidthProperty = new styleProperty.Property("borderLeftWidth", "border-left-width",
     new PropertyMetadata(0, AffectsLayout, onBorderLeftWidthPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderTopLeftRadiusProperty = new styleProperty.Property("borderTopLeftRadius", "border-top-left-radius",
    new PropertyMetadata(0, AffectsLayout, onBorderTopLeftRadiusPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderTopRightRadiusProperty = new styleProperty.Property("borderTopRightRadius", "border-top-right-radius",
    new PropertyMetadata(0, AffectsLayout, onBorderTopRightRadiusPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderBottomRightRadiusProperty = new styleProperty.Property("borderBottomRightRadius", "border-bottom-right-radius",
    new PropertyMetadata(0, AffectsLayout, onBorderBottomRightRadiusPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var borderBottomLeftRadiusProperty = new styleProperty.Property("borderBottomLeftRadius", "border-bottom-left-radius",
    new PropertyMetadata(0, AffectsLayout, onBorderBottomLeftRadiusPropertyChanged, isNonNegativeFiniteNumber), converters.numberConverter);

export var clipPathProperty = new styleProperty.Property("clipPath", "clip-path",
    new PropertyMetadata(undefined, AffectsLayout, onClipPathPropertyChanged, isClipPathValid));

function parseThickness(value: any): definition.Thickness {
    let result: definition.Thickness = { top: 0, right: 0, bottom: 0, left: 0 };
    if (types.isString(value)) {
        let arr = value.split(/[ ,]+/);
        if (arr.length === 1){
            let arr0 = parseInt(arr[0]);
            result.top = arr0;
            result.right = arr0;
            result.bottom = arr0;
            result.left = arr0;
        }
        else if (arr.length === 2){
            let arr0 = parseInt(arr[0]);
            let arr1 = parseInt(arr[1]);
            result.top = arr0;
            result.right = arr1;
            result.bottom = arr0;
            result.left = arr1;
        }
        else if (arr.length === 3){
            let arr0 = parseInt(arr[0]);
            let arr1 = parseInt(arr[1]);
            let arr2 = parseInt(arr[2]);
            result.top = arr0;
            result.right = arr1;
            result.bottom = arr2;
            result.left = arr1;
        }
        else if (arr.length === 4){
            let arr0 = parseInt(arr[0]);
            let arr1 = parseInt(arr[1]);
            let arr2 = parseInt(arr[2]);
            let arr3 = parseInt(arr[3]);
            result.top = arr0;
            result.right = arr1;
            result.bottom = arr2;
            result.left = arr3;
        }
    }
    else if (types.isNumber(value)) {
        result.top = result.right = result.bottom = result.left = value;
    }
    else {
        result = value;
    }

    return result;
}

function parseBorderColor(value: any): definition.BorderColor {
    var result: definition.BorderColor = { top: undefined, right: undefined, bottom: undefined, left: undefined };
    try {
        if (types.isString(value)) {
            if (value.indexOf("rgb") === 0){
                result.top = result.right = result.bottom = result.left = new Color(value);
                return result;
            }

            let arr = value.split(/[ ,]+/);
            if (arr.length === 1){
                let arr0 = new Color(arr[0]);
                result.top = arr0;
                result.right = arr0;
                result.bottom = arr0;
                result.left = arr0;
            }
            else if (arr.length === 2){
                let arr0 = new Color(arr[0]);
                let arr1 = new Color(arr[1]);
                result.top = arr0;
                result.right = arr1;
                result.bottom = arr0;
                result.left = arr1;
            }
            else if (arr.length === 3){
                let arr0 = new Color(arr[0]);
                let arr1 = new Color(arr[1]);
                let arr2 = new Color(arr[2]);
                result.top = arr0;
                result.right = arr1;
                result.bottom = arr2;
                result.left = arr1;
            }
            else if (arr.length === 4){
                let arr0 = new Color(arr[0]);
                let arr1 = new Color(arr[1]);
                let arr2 = new Color(arr[2]);
                let arr3 = new Color(arr[3]);
                result.top = arr0;
                result.right = arr1;
                result.bottom = arr2;
                result.left = arr3;
            }
        }
        else if (value instanceof Color) {
            result.top = result.right = result.bottom = result.left = value;
        }
        else {
            result = value;
        }
    }
    catch(ex){
        if (trace.enabled) {
            trace.write(`Error parsing border color ${value}: ${ex}'`, trace.categories.Style, trace.messageType.error);
        }
    }

    return result;
}

function onBorderColorChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    let fourColors = parseBorderColor(value);
    let array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: borderTopColorProperty, value: fourColors.top });
    array.push({ property: borderRightColorProperty, value: fourColors.right });
    array.push({ property: borderBottomColorProperty, value: fourColors.bottom });
    array.push({ property: borderLeftColorProperty, value: fourColors.left });
    return array;
}

function onBorderWidthChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var thickness = parseThickness(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: borderTopWidthProperty, value: thickness.top });
    array.push({ property: borderRightWidthProperty, value: thickness.right });
    array.push({ property: borderBottomWidthProperty, value: thickness.bottom });
    array.push({ property: borderLeftWidthProperty, value: thickness.left });
    return array;
}

function onBorderRadiusChanged(value: any): Array<styleProperty.KeyValuePair<styleProperty.Property, any>> {
    var thickness = parseThickness(value);
    var array = new Array<styleProperty.KeyValuePair<styleProperty.Property, any>>();
    array.push({ property: borderTopLeftRadiusProperty, value: thickness.top });
    array.push({ property: borderTopRightRadiusProperty, value: thickness.right });
    array.push({ property: borderBottomRightRadiusProperty, value: thickness.bottom });
    array.push({ property: borderBottomLeftRadiusProperty, value: thickness.left });
    return array;
}

styleProperty.registerShorthandCallback("border-color", onBorderColorChanged);
styleProperty.registerShorthandCallback("border-width", onBorderWidthChanged);
styleProperty.registerShorthandCallback("border-radius", onBorderRadiusChanged);
