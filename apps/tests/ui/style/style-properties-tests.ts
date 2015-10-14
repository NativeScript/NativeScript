import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import buttonModule = require("ui/button");
import stackModule = require("ui/layouts/stack-layout");
import page = require("ui/page");
import color = require("color");
import observable = require("data/observable");
import enums = require("ui/enums");
import fontModule = require("ui/styling/font");

var testBtn: buttonModule.Button;
var testPage: page.Page;

export function setUpModule() {
    var pageFactory = function () {
        testPage = new page.Page();
        testBtn = new buttonModule.Button();
        testBtn.text = "test";
        testBtn.id = "testBtn";
        testPage.content = testBtn;
        return testPage;
    };
    helper.navigate(pageFactory);
}

export function tearDownModule() {
    helper.goBack();
    testBtn = null;
    testPage = null;
}

export function tearDown() {
    testPage.css = "";
}

export function test_CSS_properties_are_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("color", "color", new color.Color("#FF0000"), "#FF0000");
}

export function test_setting_backgroundColor_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("backgroundColor", "background-color", new color.Color("#FF0000"), "#FF0000");
}

export function test_setting_backgroundRepeat_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("backgroundRepeat", "background-repeat", "repeat-x");
}

export function test_setting_backgroundSize_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("backgroundSize", "background-size", "10% 20%");
}

export function test_setting_backgroundPosition_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("backgroundPosition", "background-position", "left center");
}

export function test_setting_backgroundImage_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("backgroundImage", "background-image", "url('~/pages/test2.png')");
}

export function test_setting_borderWidth_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("borderWidth", "border-width", 5);
}

export function test_setting_borderColor_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("borderColor", "border-color", new color.Color("#FF0000"), "#FF0000");
}

export function test_setting_borderRadius_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("borderRadius", "border-radius", 20);
}

export function test_setting_textAlignment_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("textAlignment", "text-align", "center");
}

export function test_setting_width_property_from_CSS_is_applied_to_Style() {

    test_property_from_CSS_is_applied_to_style("width", "width", 200);
}

export function test_setting_height_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("height", "height", 200);
}

export function test_setting_minWidth_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("minWidth", "min-width", 200);
}

export function test_setting_minHeight_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("minHeight", "min-height", 200);
}

export function test_setting_verticalAlignment_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("verticalAlignment", "vertical-align", "bottom");
}

export function test_setting_verticalAlignment_middle_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("verticalAlignment", "vertical-align", "middle");
}

export function test_setting_horizontalAlignment_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("horizontalAlignment", "horizontal-align", "right");
}

export function test_setting_visibility_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("visibility", "visibility", "collapsed");
}

export function test_setting_opacity_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("opacity", "opacity", 0.5);
}

export function test_setting_fontSize_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("fontSize", "font-size", 32);
}

export function test_setting_fontFamily_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("fontFamily", "font-family", "Helvetica");
}

export function test_setting_fontWeight_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("fontWeight", "font-weight", "bold");
}

export function test_setting_fontStyle_property_from_CSS_is_applied_to_Style() {
    test_property_from_CSS_is_applied_to_style("fontStyle", "font-style", "italic");
}

function test_property_from_CSS_is_applied_to_style(propName: string, cssName: string, value: any, cssValue?: string) {
    if (!cssValue) {
        cssValue = value + "";
    }

    testPage.css = "#testBtn { " + cssName + ": " + cssValue + " }";

    TKUnit.assertEqual(testBtn.style[propName], value, "Setting property " + propName + " with CSS name " + cssName);

    testPage.css = "";
}

export function test_width_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("width", 200);
}

export function test_height_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("height", 200);
}

export function test_minWidth_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("minWidth", 200);
}

export function test_minHeight_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("minHeight", 200);
}

export function test_verticalAlignment_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("verticalAlignment", "bottom");
}

export function test_horizontalAlignment_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("horizontalAlignment", "right");
}

export function test_marginLeft_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("marginLeft", 10);
}

export function test_marginTop_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("marginTop", 10);
}

export function test_marginBottom_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("marginBottom", 10);
}

export function test_marginRight_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("marginRight", 10);
}

export function test_paddingLeft_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_layout_view("paddingLeft", 10);
}

export function test_paddingTop_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_layout_view("paddingTop", 10);
}

export function test_paddingBottom_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_layout_view("paddingBottom", 10);
}

export function test_paddingRight_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_layout_view("paddingRight", 10);
}

export function test_visibility_property_is_synced_in_style_and_view() {
    test_property_is_synced_in_style_and_view("visibility", "collapsed");
}

function test_property_is_synced_in_style_and_view(propName: string, value: any) {
    var testView = new buttonModule.Button();
    testView[propName] = value;
    TKUnit.assertEqual(testView.style[propName], value, "Setting view property " + propName + " does not set style property.");

    var testView2 = new buttonModule.Button();
    testView2[propName] = value;
    TKUnit.assertEqual(testView2.style[propName], value, "Setting style property " + propName + " does not set view property.");
}

function test_property_is_synced_in_style_and_layout_view(propName: string, value: any) {
    var testView = new stackModule.StackLayout();
    testView[propName] = value;
    TKUnit.assertEqual(testView.style[propName], value, "Setting view property " + propName + " does not set style property.");

    var testView2 = new stackModule.StackLayout();
    testView2[propName] = value;
    TKUnit.assertEqual(testView2.style[propName], value, "Setting style property " + propName + " does not set view property.");
}

export function test_setting_same_color_does_not_trigger_property_change() {
    var testView = new buttonModule.Button();
    testView.style.color = new color.Color("#FF0000");

    var changed = false;
    testView.style.on(observable.Observable.propertyChangeEvent, (data) => {
        changed = true;
    });

    testView.style.color = new color.Color("#FF0000");
    TKUnit.assert(!changed, "Property changed triggered.");
}

export function test_setting_different_color_triggers_property_change() {
    var testView = new buttonModule.Button();
    testView.style.color = new color.Color("#FF0000");

    var changed = false;
    testView.style.on(observable.Observable.propertyChangeEvent, (data) => {
        changed = true;
    });

    testView.style.color = new color.Color("#00FF00");
    TKUnit.assert(changed, "Property changed not triggered.");
}

export function test_setting_same_backgroundColor_does_not_trigger_property_change() {
    var testView = new buttonModule.Button();
    testView.style.backgroundColor = new color.Color("#FF0000");

    var changed = false;
    testView.style.on(observable.Observable.propertyChangeEvent, (data) => {
        changed = true;
    });

    testView.style.backgroundColor = new color.Color("#FF0000");
    TKUnit.assert(!changed, "Property changed triggered.");
}

export function test_setting_different_backgroundColor_triggers_property_change() {
    var testView = new buttonModule.Button();
    testView.style.backgroundColor = new color.Color("#FF0000");

    var changed = false;
    testView.style.on(observable.Observable.propertyChangeEvent, (data) => {
        changed = true;
    });

    testView.style.backgroundColor = new color.Color("#00FF00");
    TKUnit.assert(changed, "Property changed not triggered.");
}

export function test_setting_margin_shorthand_property_sets_all_margins() {
    test_margin_shorthand_property("10", 10, 10, 10, 10);
    test_margin_shorthand_property("10 20", 10, 20, 10, 20);
    test_margin_shorthand_property("10 20 30 40", 10, 20, 30, 40);
}

function test_margin_shorthand_property(short: string, top: number, right: number, bottom: number, left: number) {
    var testView = new buttonModule.Button();
    testView.style.margin = short;

    TKUnit.assertEqual(testView.style.marginTop, top, "top");
    TKUnit.assertEqual(testView.style.marginRight, right, "right");
    TKUnit.assertEqual(testView.style.marginBottom, bottom, "bottom");
    TKUnit.assertEqual(testView.style.marginLeft, left, "left");
}

export function test_setting_padding_shorthand_property_sets_all_paddings() {
    test_padding_shorthand_property("10", 10, 10, 10, 10);
    test_padding_shorthand_property("10 20", 10, 20, 10, 20);
    test_padding_shorthand_property("10 20 30 40", 10, 20, 30, 40);
}

function test_padding_shorthand_property(short: string, top: number, right: number, bottom: number, left: number) {
    var testView = new buttonModule.Button();
    testView.style.padding = short;

    TKUnit.assertEqual(testView.style.paddingTop, top, "top");
    TKUnit.assertEqual(testView.style.paddingRight, right, "right");
    TKUnit.assertEqual(testView.style.paddingBottom, bottom, "bottom");
    TKUnit.assertEqual(testView.style.paddingLeft, left, "left");
}

export function test_setting_font_shorthand_property() {
    test_font_shorthand_property("15px Arial", "Arial", 15, "normal", "normal");
    test_font_shorthand_property("bold 15px Arial", "Arial", 15, "normal", "bold");
    test_font_shorthand_property("italic 15px Arial", "Arial", 15, "italic", "normal");
    test_font_shorthand_property("bold italic 15px Arial", "Arial", 15, "italic", "bold");
    test_font_shorthand_property("italic normal bold 15px Arial, serif", "Arial, serif", 15, "italic", "bold");
    test_font_shorthand_property("small-caps normal bold 15px Arial", "Arial", 15, "normal", "bold");
    test_font_shorthand_property("normal normal normal 15px Arial", "Arial", 15, "normal", "normal");
    test_font_shorthand_property("normal normal normal 15px/30px Arial", "Arial", 15, "normal", "normal");
}

function test_font_shorthand_property(short: string, family: string, size: number, style: string, weight:string) {
    var testView = new buttonModule.Button();
    (<any>testView.style)["font"] = short;

    TKUnit.assertEqual(testView.style.fontFamily, family, "style.fontFamily");
    TKUnit.assertEqual(testView.style.fontStyle, style, "style.fontStyle");
    TKUnit.assertEqual(testView.style.fontWeight, weight, "style.fontWeight");
    TKUnit.assertEqual(testView.style.fontSize, size, "style.fontSize");
}

export function test_setting_font_properties_sets_native_font() {

    if (fontModule.ios) {
        var basePath = "fonts";
        fontModule.ios.registerFont(basePath + "/Roboto-Regular.ttf");
        fontModule.ios.registerFont(basePath + "/Roboto-Bold.ttf");
        fontModule.ios.registerFont(basePath + "/Roboto-BoldItalic.ttf");
        fontModule.ios.registerFont(basePath + "/Roboto-Italic.ttf");
    }

    test_native_font(enums.FontStyle.normal, enums.FontWeight.normal);
    test_native_font(enums.FontStyle.italic, enums.FontWeight.normal);
    test_native_font(enums.FontStyle.normal, enums.FontWeight.bold);
    test_native_font(enums.FontStyle.italic, enums.FontWeight.bold);    
}

function test_native_font(style: string, weight: string) {
    var testView = new buttonModule.Button();
    var fontName = "Roboto";
    var fontNameSuffix = "";

    testView.style.fontFamily = fontName;
    testView.style.fontWeight = weight;
    testView.style.fontStyle = style;

    if (style === enums.FontStyle.normal && weight === enums.FontWeight.normal)
    {
        fontNameSuffix += "Regular";
    }
    if (weight === enums.FontWeight.bold)
    {
        fontNameSuffix += "Bold";
    }
    if (style === enums.FontStyle.italic)
    {
        fontNameSuffix += "Italic";
    }

    if (testView.ios) {
        TKUnit.assertEqual((<UIButton>testView.ios).titleLabel.font.fontName.toLowerCase(), (fontName + "-" + fontNameSuffix).toLowerCase(), "native font " + weight + " " + style);
    }
    //TODO: If needed add tests for other platforms
}
