import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import pagesModule = require("ui/page");
import buttonTestsNative = require("./button-tests-native");
import colorModule = require("color");
import enums = require("ui/enums");
import formattedStringModule = require("text/formatted-string");
import spanModule = require("text/span");

// >> button-require
import buttonModule = require("ui/button");
// << button-require

// >> button-require-others
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
// << button-require-others

export var testSetText = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testSetText);
}

export var testOnClick = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testOnClick);
}

export var testBindTextDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testBindTextDirectlyToModel);
}

export var testBindTextToBindingContext = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testBindTextToBindingContext);
}

export var testLocalFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testLocalFontSizeFromCss);
}

export var testNativeFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeFontSizeFromCss);
}

export var testNativeFontSizeFromLocal = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeFontSizeFromLocal);
}

export var testLocalColorFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testLocalColorFromCss);
}

export var testNativeColorFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeColorFromCss);
}

export var testNativeColorFromLocal = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeColorFromLocal);
}

export var testLocalBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testLocalBackgroundColorFromCss);
}

export var testNativeBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeBackgroundColorFromCss);
}

export var testNativeBackgroundColorFromLocal = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), _testNativeBackgroundColorFromLocal);
}

export var testMemoryLeak = function (done) {
    helper.buildUIWithWeakRefAndInteract(_createButtonFunc, function (button) {
        buttonTestsNative.performNativeClick(button);
    }, done);
}

var _createButtonFunc = function (): buttonModule.Button {
    // >>button-create
    var button = new buttonModule.Button();
    // << button-create
    button.text = "Button";  
    return button;
}

var _testSetText = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    // >> button-settext
    button.text = "Hello, world!";
    // << button-settext

    var expectedValue = button.text;
    var actualValue = buttonTestsNative.getNativeText(button);

    TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
}

var _testOnClick = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];

    var actualValue = false;
    // >> button-tap
    button.on(buttonModule.Button.tapEvent, function (args: observable.EventData) {
        // Do something
        // >> (hide)
        actualValue = true;
        // << (hide)
    });
    // << button-tap

    buttonTestsNative.performNativeClick(button);
    TKUnit.assert(actualValue === true, "Actual: " + actualValue + "; Expected: " + true);
}

var _testBindTextDirectlyToModel = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];

    // >> button-bind
    var model = new observable.Observable();
    model.set("buttonTitle", "OK");
    var options: bindable.BindingOptions = {
        sourceProperty: "buttonTitle",
        targetProperty: "text"
    }
    button.bind(options, model);
    // button.text is now "OK"
    // >> (hide)
    TKUnit.assert(button.text === "OK", "Actual: " + button.text + "; Expected: " + "OK");
    // << (hide)
    model.set("buttonTitle", "Cancel");
    // button.text is now "Cancel"
    // >> (hide)
    TKUnit.assert(button.text === "Cancel", "Actual: " + button.text + "; Expected: " + "Cancel");
    // << (hide)
    // << button-bind
}

var _testBindTextToBindingContext = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];

    var model = new observable.Observable();
    model.set("buttonTitle", "OK");
    page.bindingContext = model;

    var options: bindable.BindingOptions = {
        sourceProperty: "buttonTitle",
        targetProperty: "text"
    }
    button.bind(options);

    TKUnit.assert(button.text === "OK", "Actual: " + button.text + "; Expected: " + "OK");
    model.set("buttonTitle", "Cancel");
    TKUnit.assert(button.text === "Cancel", "Actual: " + button.text + "; Expected: " + "Cancel");
}

var expectedFontSize = 42;
var _testLocalFontSizeFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];

    page.css = "button { font-size: " + expectedFontSize + "; }";
    var actualResult = button.style.fontSize;
    TKUnit.assert(actualResult === expectedFontSize, "Actual: " + actualResult + "; Expected: " + 33);
}

var _testNativeFontSizeFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];
    page.css = "button { font-size: " + expectedFontSize + "; }";

    var actualResult = buttonTestsNative.getNativeFontSize(button);
    helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromCss");
}

var _testNativeFontSizeFromLocal = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    button.style.fontSize = expectedFontSize;

    var actualResult = buttonTestsNative.getNativeFontSize(button);
    helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromLocal");
}

var expectedColorHex = "#ffff0000";
var _testLocalColorFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];
    page.css = "button { color: " + expectedColorHex + "; }";

    var actualResult = button.style.color.hex;
    TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
}

var _testNativeColorFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];
    page.css = "button { color: " + expectedColorHex + "; }";

    var actualResult = buttonTestsNative.getNativeColor(button).hex;
    TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
}

var _testNativeColorFromLocal = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    button.style.color = new colorModule.Color(expectedColorHex);

    var actualResult = buttonTestsNative.getNativeColor(button).hex;
    TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
}

var expectedBackgroundColorHex = "#ff00ff00";
var _testLocalBackgroundColorFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];
    page.css = "button { background-color: " + expectedBackgroundColorHex + "; }";

    var actualResult = button.style.backgroundColor.hex;
    TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
}

var _testNativeBackgroundColorFromCss = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    var page = <pagesModule.Page>views[1];
    page.css = "button { background-color: " + expectedBackgroundColorHex + "; }";

    var actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
    TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
}

var _testNativeBackgroundColorFromLocal = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    button.style.backgroundColor = new colorModule.Color(expectedBackgroundColorHex);

    var actualResult = buttonTestsNative.getNativeBackgroundColor(button).hex;
    TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
}

var expectedTextAlignment = enums.TextAlignment.right;
export var testLocalTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "button { text-align: " + expectedTextAlignment + "; }";

        var actualResult = view.style.textAlignment;
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "button { text-align: " + expectedTextAlignment + "; }";

        var actualResult = buttonTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var test_StateHighlighted_also_fires_pressedState = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        var page = <pagesModule.Page>views[1];
        var expectedColor = "#ffff0000";
        page.css = "button:pressed { background-color: " + expectedColor + "; }";

        view._goToVisualState('highlighted');

        var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
        TKUnit.assert(actualResult.hex === expectedColor, "Actual: " + actualResult.hex + "; Expected: " + expectedColor);
    });
}

export var test_StateHighlighted_also_fires_activeState = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        var page = <pagesModule.Page>views[1];
        var expectedColor = "#ffff0000";
        page.css = "button:active { background-color: " + expectedColor + "; }";

        view._goToVisualState('highlighted');

        var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
        TKUnit.assert(actualResult.hex === expectedColor, "Actual: " + actualResult.hex + "; Expected: " + expectedColor);
    });
}

export var test_applying_disabled_visual_State_when_button_is_disable = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        var page = <pagesModule.Page>views[1];
        var expectedColor = "#ffff0000";
        page.css = "button:disabled { background-color: " + expectedColor + "; }";

        view.isEnabled = false;

        var actualResult = buttonTestsNative.getNativeBackgroundColor(view);
        TKUnit.assert(actualResult.hex === expectedColor, "Actual: " + actualResult.hex + "; Expected: " + expectedColor);
    });
}

export var testNativeTextAlignmentFromLocal = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        view.style.textAlignment = expectedTextAlignment;

        var actualResult = buttonTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var test_WhenFormattedTextPropertyChanges_TextIsUpdated_Button = function () {
    var firstSpan = new spanModule.Span();
    firstSpan.fontSize = 10;
    firstSpan.text = "First";
    var secondSpan = new spanModule.Span();
    secondSpan.fontSize = 15;
    secondSpan.text = "Second";
    var thirdSpan = new spanModule.Span();
    thirdSpan.fontSize = 20;
    thirdSpan.text = "Third";
    var formattedString1 = new formattedStringModule.FormattedString();
    formattedString1.spans.push(firstSpan);
    var formattedString2 = new formattedStringModule.FormattedString();
    formattedString2.spans.push(secondSpan);
    formattedString2.spans.push(thirdSpan);

    var view = new buttonModule.Button();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(view.text, "");

        view.formattedText = formattedString1;
        TKUnit.assertEqual(view.text, "First");

        view.formattedText = formattedString2;
        TKUnit.assertEqual(view.text, "SecondThird");

        formattedString2.spans.getItem(0).text = "Mecond";
        TKUnit.assertEqual(view.text, "MecondThird");

        view.formattedText = null;
        TKUnit.assertEqual(view.text, "");
    });
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
    let view = new buttonModule.Button();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        view.text = "NormalText";
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");
        
        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
    });
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
    let view = new buttonModule.Button();
    let formattedString = helper._generateFormattedString();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        view.formattedText = formattedString;
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");
        
        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
    });
}