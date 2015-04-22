import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import pagesModule = require("ui/page");
import textFieldTestsNative = require("./text-field-tests-native");
import colorModule = require("color");
import enums = require("ui/enums");

// <snippet module="ui/text-field" title="TextField">
// # TextField

// Using a TextField requires the text-field module.
// ``` JavaScript
import textFieldModule = require("ui/text-field");
// ```
// Other frequently used modules when working with buttons include:
// ``` JavaScript
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
// ```

// ### Binding two TextFields text property to observable view-model property.
//```XML
// <Page loaded="pageLoaded">
//  <StackLayout orientation="vertical">
//    {%raw%}<TextField text="{{ someProperty }}" />
//    <TextField text="{{ someProperty }}" />{%endraw%}
//  </StackLayout>
// </Page>
//```
//```JS
// function pageLoaded(args) {
//   var page = args.object;
//   var obj = new observable.Observable();
//   obj.set("someProperty", "Please change this text!");
//   page.bindingContext = obj;
// }
// exports.pageLoaded = pageLoaded;
//```

// </snippet> 

var _createTextFieldFunc = function (): textFieldModule.TextField {
    // <snippet module="ui/text-field" title="TextField">
    // ## Creating a TextField
    // ``` JavaScript
    var textField = new textFieldModule.TextField();
    // ```
    // </snippet>
    textField.text = "textField";
    return textField;
}

export var testSetText = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        
        // <snippet module="ui/text-field" title="TextField">
        // ### Setting the text of a TextField
        // ``` JavaScript
        textField.text = "Hello, world!";
        // ```
        // </snippet>

        var expectedValue = "Hello, world!";
        var actualValue = textFieldTestsNative.getNativeText(textField);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });    
}

export var testBindTextDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];

        // <snippet module="ui/text-field" title="TextField">
        // ### Binding text property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("username", "john");
        var options: bindable.BindingOptions = {
            sourceProperty: "username",
            targetProperty: "text"
        }
        textField.bind(options, model);
        //// textField.text is now "john"
        // <hide>
        TKUnit.assert(textField.text === "john", "Actual: " + textField.text + "; Expected: " + "john");
        TKUnit.assert(textFieldTestsNative.getNativeText(textField) === "john", "Actual: " + textFieldTestsNative.getNativeText(textField) + "; Expected: " + "john");
        // </hide>
        model.set("username", "mary");
        //// textField.text is now "mary"
        // <hide>
        TKUnit.assert(textField.text === "mary", "Actual: " + textField.text + "; Expected: " + "mary");
        TKUnit.assert(textFieldTestsNative.getNativeText(textField) === "mary", "Actual: " + textFieldTestsNative.getNativeText(textField) + "; Expected: " + "mary");
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindTextToBindingContext = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("username", "john");
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "username",
            targetProperty: "text"
        }

        textField.bind(options);
        TKUnit.assert(textField.text === "john", "Actual: " + textField.text + "; Expected: " + "john");
        TKUnit.assert(textFieldTestsNative.getNativeText(textField) === "john", "Actual: " + textFieldTestsNative.getNativeText(textField) + "; Expected: " + "john");

        model.set("username", "mary");
        TKUnit.assert(textField.text === "mary", "Actual: " + textField.text + "; Expected: " + "mary");
        TKUnit.assert(textFieldTestsNative.getNativeText(textField) === "mary", "Actual: " + textFieldTestsNative.getNativeText(textField) + "; Expected: " + "mary");
    });
}

export var testTextIsUpdatedWhenUserTypes = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        textField.updateTextTrigger = enums.UpdateTextTrigger.focusLost;

        var expectedValue = "Hello, world!";
        textFieldTestsNative.typeTextNatively(textField, expectedValue);

        var actualValue = textField.text;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSetHint = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];

        // <snippet module="ui/text-field" title="TextField">
        // ### Setting the hint of a TextField
        // ``` JavaScript
        textField.hint = "type your username here";
        // ```
        // </snippet>

        var expectedValue = "type your username here";
        var actualValue = textFieldTestsNative.getNativeHint(textField);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBindHintDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];

        // <snippet module="ui/text-field" title="TextField">
        // ### Binding hint property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("hint", "type your username here");
        var options: bindable.BindingOptions = {
            sourceProperty: "hint",
            targetProperty: "hint"
        }
        textField.bind(options, model);
        //// textField.hint is now "type your username here"
        // <hide>
        TKUnit.assert(textField.hint === "type your username here", "Actual: " + textField.text + "; Expected: " + "type your username here");
        TKUnit.assert(textFieldTestsNative.getNativeHint(textField) === "type your username here", "Actual: " + textFieldTestsNative.getNativeHint(textField) + "; Expected: " + "type your username here");
        // </hide>
        model.set("hint", "type your password here");
        //// textField.hint is now "type your password here"
        // <hide>
        TKUnit.assert(textField.hint === "type your password here", "Actual: " + textField.text + "; Expected: " + "type your password here");
        TKUnit.assert(textFieldTestsNative.getNativeHint(textField) === "type your password here", "Actual: " + textFieldTestsNative.getNativeHint(textField) + "; Expected: " + "type your password here");
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindHintToBindingConext = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("hint", "type your username here");
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "hint",
            targetProperty: "hint"
        }

        textField.bind(options);
        TKUnit.assert(textField.hint === "type your username here", "Actual: " + textField.hint + "; Expected: " + "type your username here");
        TKUnit.assert(textFieldTestsNative.getNativeHint(textField) === "type your username here", "Actual: " + textFieldTestsNative.getNativeHint(textField) + "; Expected: " + "type your username here");

        model.set("hint", "type your password here");
        TKUnit.assert(textField.hint === "type your password here", "Actual: " + textField.text + "; Expected: " + "type your password here");
        TKUnit.assert(textFieldTestsNative.getNativeHint(textField) === "type your password here", "Actual: " + textFieldTestsNative.getNativeHint(textField) + "; Expected: " + "type your password here");
    });
}

export var testSetSecure = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];

        // <snippet module="ui/text-field" title="TextField">
        // ### Setting the secure property of a TextField
        // ``` JavaScript
        textField.secure = true;
        // ```
        // </snippet>

        var expectedValue = true;
        var actualValue = textFieldTestsNative.getNativeSecure(textField);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBindSecureDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];

        // <snippet module="ui/text-field" title="TextField">
        // ### Binding secure property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("secure", true);
        var options: bindable.BindingOptions = {
            sourceProperty: "secure",
            targetProperty: "secure"
        }
        textField.bind(options, model);
        //// textField.secure is now true
        // <hide>
        TKUnit.assert(textField.secure === true, "Actual: " + textField.secure + "; Expected: " + true);
        TKUnit.assert(textFieldTestsNative.getNativeSecure(textField) === true, "Actual: " + textFieldTestsNative.getNativeSecure(textField) + "; Expected: " + true);
        // </hide>
        model.set("secure", false);
        //// textField.secure is now false
        // <hide>
        TKUnit.assert(textField.secure === false, "Actual: " + textField.secure + "; Expected: " + false);
        TKUnit.assert(textFieldTestsNative.getNativeSecure(textField) === false, "Actual: " + textFieldTestsNative.getNativeSecure(textField) + "; Expected: " + false);
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindSecureToBindingConext = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("secure", true);
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "secure",
            targetProperty: "secure"
        }

        textField.bind(options);
        TKUnit.assert(textField.secure === true, "Actual: " + textField.secure + "; Expected: " + true);
        TKUnit.assert(textFieldTestsNative.getNativeSecure(textField) === true, "Actual: " + textFieldTestsNative.getNativeSecure(textField) + "; Expected: " + true);

        model.set("secure", false);
        TKUnit.assert(textField.secure === false, "Actual: " + textField.secure + "; Expected: " + false);
        TKUnit.assert(textFieldTestsNative.getNativeSecure(textField) === false, "Actual: " + textFieldTestsNative.getNativeSecure(textField) + "; Expected: " + false);
    });
}

var expectedFontSize = 42;
export var testLocalFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];

        page.css = "textfield { font-size: " + expectedFontSize + "; }";
        var actualResult = textField.style.fontSize;
        TKUnit.assert(actualResult === expectedFontSize, "Actual: " + actualResult + "; Expected: " + expectedFontSize);
    });
}

export var testNativeFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { font-size: " + expectedFontSize + "; }";

        var actualResult = textFieldTestsNative.getNativeFontSize(textField);
        helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromCss");
    });
}

export var testNativeFontSizeFromLocal = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        textField.style.fontSize = expectedFontSize;

        var actualResult = textFieldTestsNative.getNativeFontSize(textField);
        helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromLocal");
    });
}

var expectedColorHex = "#ffff0000";
export var testLocalColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { color: " + expectedColorHex + "; }";

        var actualResult = textField.style.color.hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

export var testNativeColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { color: " + expectedColorHex + "; }";

        var actualResult = textFieldTestsNative.getNativeColor(textField).hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

export var testNativeColorFromLocal = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        textField.style.color = new colorModule.Color(expectedColorHex);

        var actualResult = textFieldTestsNative.getNativeColor(textField).hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

var expectedBackgroundColorHex = "#ff00ff00";
export var testLocalBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { background-color: " + expectedBackgroundColorHex + "; }";

        var actualResult = textField.style.backgroundColor.hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

export var testNativeBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { background-color: " + expectedBackgroundColorHex + "; }";

        var actualResult = textFieldTestsNative.getNativeBackgroundColor(textField).hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

export var testNativeBackgroundColorFromLocal = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var textField = <textFieldModule.TextField>views[0];
        textField.style.backgroundColor = new colorModule.Color(expectedBackgroundColorHex);

        var actualResult = textFieldTestsNative.getNativeBackgroundColor(textField).hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

var expectedTextAlignment = enums.TextAlignment.right;
export var testLocalTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var view = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { text-align: " + expectedTextAlignment + "; }";

        var actualResult = view.style.textAlignment;
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var view = <textFieldModule.TextField>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textfield { text-align: " + expectedTextAlignment + "; }";

        var actualResult = textFieldTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromLocal = function () {
    helper.buildUIAndRunTest(_createTextFieldFunc(), function (views: Array<viewModule.View>) {
        var view = <textFieldModule.TextField>views[0];
        view.style.textAlignment = expectedTextAlignment;

        var actualResult = textFieldTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testMemoryLeak = function () {
    helper.buildUIWithWeakRefAndInteract(_createTextFieldFunc, function (textField) {
        textFieldTestsNative.typeTextNatively(textField, "Hello, world!");
    });
}
