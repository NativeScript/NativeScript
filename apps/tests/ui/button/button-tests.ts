import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import pagesModule = require("ui/page");
import buttonTestsNative = require("./button-tests-native");
import colorModule = require("color");
import enums = require("ui/enums");

// <snippet module="ui/button" title="button">
// # Button
// ### Declaring button module
// Button module is required to use any button feature.
// ``` JavaScript
import buttonModule = require("ui/button");
// ```

// Other frequently used modules when working with buttons include:
// ``` JavaScript
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
// ```

// ### Attaching event handler for the button tap event.
//```XML
// <Page>
//   <Button tap="buttonTap" />
// </Page>
//```

// </snippet> 

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

export var testMemoryLeak = function () {
    helper.buildUIWithWeakRefAndInteract(_createButtonFunc, function (button) {
        buttonTestsNative.performNativeClick(button);
    });
}

var _createButtonFunc = function (): buttonModule.Button {
    // <snippet module="ui/button" title="button">
    // ### Creating a button
    // ``` JavaScript
    var button = new buttonModule.Button();
    // ```
    // </snippet>
    button.text = "Button";
    return button;
}

var _testSetText = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];
    // <snippet module="ui/button" title="button">
    // ### Setting the text of a button
    // ``` JavaScript
    button.text = "Hello, world!";
    // ```
    // </snippet>

    var expectedValue = button.text;
    var actualValue = buttonTestsNative.getNativeText(button);

    TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
}

var _testOnClick = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];

    var actualValue = false;
    // <snippet module="ui/button" title="button">
    // ### Responding to the tap event
    // ``` JavaScript
    button.on(buttonModule.knownEvents.tap, function (args: observable.EventData) {
        //// Do something
        // <hide>
        actualValue = true;
        // </hide>
    });
    // ```
    // </snippet>

    buttonTestsNative.performNativeClick(button);
    TKUnit.assert(actualValue === true, "Actual: " + actualValue + "; Expected: " + true);
}

var _testBindTextDirectlyToModel = function (views: Array<viewModule.View>) {
    var button = <buttonModule.Button>views[0];

    // <snippet module="ui/button" title="button">
    // ### Binding text property directly to model
    // ``` JavaScript
    var model = new observable.Observable();
    model.set("buttonTitle", "OK");
    var options: bindable.BindingOptions = {
        sourceProperty: "buttonTitle",
        targetProperty: "text"
    }
    button.bind(options, model);
    //// button.text is now "OK"
    // <hide>
    TKUnit.assert(button.text === "OK", "Actual: " + button.text + "; Expected: " + "OK");
    // </hide>
    model.set("buttonTitle", "Cancel");
    //// button.text is now "Cancel"
    // <hide>
    TKUnit.assert(button.text === "Cancel", "Actual: " + button.text + "; Expected: " + "Cancel");
    // </hide>
    // ```
    // </snippet>
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

export var testNativeTextAlignmentFromLocal = function () {
    helper.buildUIAndRunTest(_createButtonFunc(), function (views: Array<viewModule.View>) {
        var view = <buttonModule.Button>views[0];
        view.style.textAlignment = expectedTextAlignment;

        var actualResult = buttonTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}
