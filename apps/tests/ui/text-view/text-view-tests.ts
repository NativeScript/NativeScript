import TKUnit = require("../../TKUnit");
import testRunner = require("../../testRunner");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import pagesModule = require("ui/page");
import textViewTestsNative = require("./text-view-tests-native");
import colorModule = require("color");
import enums = require("ui/enums");

// <snippet module="ui/text-view" title="TextView">
// # TextView

// Using a TextView requires the text-view module.
// ``` JavaScript
import textViewModule = require("ui/text-view");
// ```
// Other frequently used modules when working with buttons include:
// ``` JavaScript
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
// ```

// ### Binding two TextViews text property to observable view-model property.
//```XML
// <Page loaded="pageLoaded">
//  <StackLayout orientation="vertical">
//    {%raw%}<TextView text="{{ someProperty }}" />
//    <TextView text="{{ someProperty }}" />{%endraw%}
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

var _createTextViewFunc = function (): textViewModule.TextView {
    // <snippet module="ui/text-view" title="TextView">
    // ### Creating a TextView
    // ``` JavaScript
    var textView = new textViewModule.TextView();
    // ```
    // </snippet>
    textView.text = "textView";
    return textView;
}

export var testSetText = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        
        // <snippet module="ui/text-view" title="TextView">
        // ### Setting the text of a TextView
        // ``` JavaScript
        textView.text = "Hello, world!";
        // ```
        // </snippet>

        var expectedValue = "Hello, world!";
        var actualValue = textViewTestsNative.getNativeText(textView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBindTextDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];

        // <snippet module="ui/text-view" title="TextView">
        // ### Binding text property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("username", "john");
        var options: bindable.BindingOptions = {
            sourceProperty: "username",
            targetProperty: "text"
        }
        textView.bind(options, model);
        //// textView.text is now "john"
        // <hide>
        TKUnit.assert(textView.text === "john", "Actual: " + textView.text + "; Expected: " + "john");
        TKUnit.assert(textViewTestsNative.getNativeText(textView) === "john", "Actual: " + textViewTestsNative.getNativeText(textView) + "; Expected: " + "john");
        // </hide>
        model.set("username", "mary");
        //// textView.text is now "mary"
        // <hide>
        TKUnit.assert(textView.text === "mary", "Actual: " + textView.text + "; Expected: " + "mary");
        TKUnit.assert(textViewTestsNative.getNativeText(textView) === "mary", "Actual: " + textViewTestsNative.getNativeText(textView) + "; Expected: " + "mary");
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindTextToBindingContext = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("username", "john");
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "username",
            targetProperty: "text"
        }

        textView.bind(options);
        TKUnit.assert(textView.text === "john", "Actual: " + textView.text + "; Expected: " + "john");
        TKUnit.assert(textViewTestsNative.getNativeText(textView) === "john", "Actual: " + textViewTestsNative.getNativeText(textView) + "; Expected: " + "john");

        model.set("username", "mary");
        TKUnit.assert(textView.text === "mary", "Actual: " + textView.text + "; Expected: " + "mary");
        TKUnit.assert(textViewTestsNative.getNativeText(textView) === "mary", "Actual: " + textViewTestsNative.getNativeText(textView) + "; Expected: " + "mary");
    });
}

export var testTextIsUpdatedWhenUserTypes = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.updateTextTrigger = enums.UpdateTextTrigger.focusLost;

        var expectedValue = "Hello, world!";
        textViewTestsNative.typeTextNatively(textView, expectedValue);

        var actualValue = textView.text;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSetHint = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.text = "";

        // <snippet module="ui/text-view" title="TextView">
        // ### Setting the hint of a TextView
        // ``` JavaScript
        textView.hint = "type your username here";
        // ```
        // </snippet>

        var expectedValue = "type your username here";
        var actualValue = textViewTestsNative.getNativeHint(textView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBindHintDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.text = "";

        // <snippet module="ui/text-view" title="TextView">
        // ### Binding hint property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("hint", "type your username here");
        var options: bindable.BindingOptions = {
            sourceProperty: "hint",
            targetProperty: "hint"
        }
        textView.bind(options, model);
        //// TextView.hint is now "type your username here"
        // <hide>
        TKUnit.assert(textView.hint === "type your username here", "Actual: " + textView.hint + "; Expected: " + "type your username here");
        TKUnit.assert(textViewTestsNative.getNativeHint(textView) === "type your username here", "Actual: " + textViewTestsNative.getNativeHint(textView) + "; Expected: " + "type your username here");
        // </hide>
        model.set("hint", "type your password here");
        //// TextView.hint is now "type your password here"
        // <hide>
        TKUnit.assert(textView.hint === "type your password here", "Actual: " + textView.hint + "; Expected: " + "type your password here");
        TKUnit.assert(textViewTestsNative.getNativeHint(textView) === "type your password here", "Actual: " + textViewTestsNative.getNativeHint(textView) + "; Expected: " + "type your password here");
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindHintToBindingConext = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.text = "";
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("hint", "type your username here");
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "hint",
            targetProperty: "hint"
        }

        textView.bind(options);
        TKUnit.assert(textView.hint === "type your username here", "Actual: " + textView.hint + "; Expected: " + "type your username here");
        TKUnit.assert(textViewTestsNative.getNativeHint(textView) === "type your username here", "Actual: " + textViewTestsNative.getNativeHint(textView) + "; Expected: " + "type your username here");

        model.set("hint", "type your password here");
        TKUnit.assert(textView.hint === "type your password here", "Actual: " + textView.hint + "; Expected: " + "type your password here");
        TKUnit.assert(textViewTestsNative.getNativeHint(textView) === "type your password here", "Actual: " + textViewTestsNative.getNativeHint(textView) + "; Expected: " + "type your password here");
    });
}

export var testHintPlusTextiOS = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        if (!textView.ios) {
            return;
        }

        var expectedValue;
        var actualValue;

        textView.hint = "hint";
        textView.text = "text";

        expectedValue = "text";
        actualValue = textViewTestsNative.getNativeText(textView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);

        textView.text = "";
        expectedValue = "hint";
        actualValue = textViewTestsNative.getNativeText(textView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testHintColoriOS = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        if (!textView.ios) {
            return;
        }

        textView.text = "";
        textView.color = new colorModule.Color("red");
        textView.hint = "hint";

        var expectedValue;
        var actualValue;

        // expectedValue = "#38.1999948ff0000"; // 22% red
        // if (utils.ios.MajorVersion > 7) {
        //     expectedValue = "#38.19999999999aff0000"; // 22% red
        // }
        actualValue = textViewTestsNative.getNativeColor(textView).hex;
        // TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
        TKUnit.assert(actualValue.indexOf("#38.19999") === 0, "Expected hint color to start with #38.19999");
        TKUnit.assert(actualValue.indexOf("ff0000") !== -1, "Expected hint color to end with ff0000");

        textView.text = "text";

        expectedValue = "#ffff0000"; // red
        actualValue = textViewTestsNative.getNativeColor(textView).hex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSetEditable = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];

        // <snippet module="ui/text-view" title="TextView">
        // ### Setting the editable property of a TextView
        // ``` JavaScript
        textView.editable = false;
        // ```
        // </snippet>

        var expectedValue = false;
        var actualValue = textViewTestsNative.getNativeEditable(textView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testBindEditableDirectlyToModel = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];

        // <snippet module="ui/text-view" title="TextView">
        // ### Binding editable property directly to model
        // ``` JavaScript
        var model = new observable.Observable();
        model.set("editable", false);
        var options: bindable.BindingOptions = {
            sourceProperty: "editable",
            targetProperty: "editable"
        }
        textView.bind(options, model);
        //// textView.editable is now false
        // <hide>
        TKUnit.assert(textView.editable === false, "Actual: " + textView.text + "; Expected: " + false);
        TKUnit.assert(textViewTestsNative.getNativeEditable(textView) === false, "Actual: " + textViewTestsNative.getNativeEditable(textView) + "; Expected: " + false);
        // </hide>
        model.set("editable", true);
        //// textView.editable is now true
        // <hide>
        TKUnit.assert(textView.editable === true, "Actual: " + textView.text + "; Expected: " + true);
        TKUnit.assert(textViewTestsNative.getNativeEditable(textView) === true, "Actual: " + textViewTestsNative.getNativeEditable(textView) + "; Expected: " + true);
        // </hide>
        // ```
        // </snippet>
    });
}

export var testBindEditableToBindingConext = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];

        var model = new observable.Observable();
        model.set("editable", false);
        page.bindingContext = model;

        var options: bindable.BindingOptions = {
            sourceProperty: "editable",
            targetProperty: "editable"
        }

        textView.bind(options);
        TKUnit.assert(textView.editable === false, "Actual: " + textView.text + "; Expected: " + false);
        TKUnit.assert(textViewTestsNative.getNativeEditable(textView) === false, "Actual: " + textViewTestsNative.getNativeEditable(textView) + "; Expected: " + false);

        model.set("editable", true);
        TKUnit.assert(textView.editable === true, "Actual: " + textView.text + "; Expected: " + true);
        TKUnit.assert(textViewTestsNative.getNativeEditable(textView) === true, "Actual: " + textViewTestsNative.getNativeEditable(textView) + "; Expected: " + true);
    });
}

var expectedFontSize = 42;
export var testLocalFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];

        page.css = "textview { font-size: " + expectedFontSize + "; }";
        var actualResult = textView.style.fontSize;
        TKUnit.assert(actualResult === expectedFontSize, "Actual: " + actualResult + "; Expected: " + expectedFontSize);
    });
}

export var testNativeFontSizeFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { font-size: " + expectedFontSize + "; }";

        var actualResult = textViewTestsNative.getNativeFontSize(textView);
        helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromCss");
    });
}

export var testNativeFontSizeFromLocal = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.style.fontSize = expectedFontSize;

        var actualResult = textViewTestsNative.getNativeFontSize(textView);
        helper.assertAreClose(actualResult, expectedFontSize, "FontSizeFromLocal");
    });
}

var expectedColorHex = "#ffff0000";
export var testLocalColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { color: " + expectedColorHex + "; }";

        var actualResult = textView.style.color.hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

export var testNativeColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { color: " + expectedColorHex + "; }";

        var actualResult = textViewTestsNative.getNativeColor(textView).hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

export var testNativeColorFromLocal = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.style.color = new colorModule.Color(expectedColorHex);

        var actualResult = textViewTestsNative.getNativeColor(textView).hex;
        TKUnit.assert(actualResult === expectedColorHex, "Actual: " + actualResult + "; Expected: " + expectedColorHex);
    });
}

var expectedBackgroundColorHex = "#ff00ff00";
export var testLocalBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { background-color: " + expectedBackgroundColorHex + "; }";

        var actualResult = textView.style.backgroundColor.hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

export var testNativeBackgroundColorFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { background-color: " + expectedBackgroundColorHex + "; }";

        var actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

export var testNativeBackgroundColorFromLocal = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var textView = <textViewModule.TextView>views[0];
        textView.style.backgroundColor = new colorModule.Color(expectedBackgroundColorHex);

        var actualResult = textViewTestsNative.getNativeBackgroundColor(textView).hex;
        TKUnit.assert(actualResult === expectedBackgroundColorHex, "Actual: " + actualResult + "; Expected: " + expectedBackgroundColorHex);
    });
}

var expectedTextAlignment = enums.TextAlignment.right;
export var testLocalTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var view = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { text-align: " + expectedTextAlignment + "; }";

        var actualResult = view.style.textAlignment;
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var view = <textViewModule.TextView>views[0];
        var page = <pagesModule.Page>views[1];
        page.css = "textview { text-align: " + expectedTextAlignment + "; }";

        var actualResult = textViewTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromLocal = function () {
    helper.buildUIAndRunTest(_createTextViewFunc(), function (views: Array<viewModule.View>) {
        var view = <textViewModule.TextView>views[0];
        view.style.textAlignment = expectedTextAlignment;

        var actualResult = textViewTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testMemoryLeak = function (done) {
    helper.buildUIWithWeakRefAndInteract(_createTextViewFunc, function (textView) {
        textViewTestsNative.typeTextNatively(textView, "Hello, world!");
    }, done);
}
