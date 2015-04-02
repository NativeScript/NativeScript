import TKUnit = require("../../TKUnit");
// <snippet module="ui/label" title="Label">
// # Label
// Using a label requires the Label module.
// ``` JavaScript
import LabelModule = require("ui/label");
// ```

// ### Binding the Label text property to a view-model property.
//```XML
// <Page>
//   {%raw%}<Label text="{{ title }}" />{%endraw%}
// </Page>
//```

// </snippet>
import types = require("utils/types");
import view = require("ui/core/view");
import colorModule = require("color");
import helper = require("../helper");
import utils = require("utils/utils");
import observableModule = require("data/observable");
import bindable = require("ui/core/bindable");
import page = require("ui/page");
import textBase = require("ui/text-base");
import enums = require("ui/enums");
import labelTestsNative = require("./label-tests-native");
import trace = require("trace");
import fs = require("file-system");

var errorMessage;
var errorTraceWriter = {
    write: function (message, category, messageType) {
        if (category === trace.categories.Error) {
            errorMessage = message;
        }
    }
}

export var setUp = function () {
    trace.addWriter(errorTraceWriter);
}

export var tearDown = function () {
    trace.removeWriter(errorTraceWriter);
    errorMessage = undefined;
}

export var test_Label_Members = function () {
    var label = new LabelModule.Label();
    TKUnit.assert(types.isDefined(label.text), "Label.text is not defined");
    TKUnit.assert(types.isDefined(label.textWrap), "Label.textWrap is not defined");
}

export var test_Set_Text_TNS = function () {
    // <snippet module="ui/label" title="Label">
    // ### How to set label text content
    // ``` JavaScript
    var label = new LabelModule.Label();
    var expectedValue = "Expected Value";
    label.text = expectedValue;
    // ```
    // </snippet>

    var actual = label._getValue(textBase.TextBase.textProperty);
    TKUnit.assert(actual === expectedValue, "The current value: " + actual + " is not equal the espectedValue: " + expectedValue);
}

export var test_Set_Text_Native = function () {
    var label = new LabelModule.Label();

    var test = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label>views[0];
        var expectedValue = "Expected Value";

        testLabel.text = expectedValue;
        var actualNative;
        if (testLabel.android) {
            actualNative = testLabel.android.getText();
        }
        else {
            actualNative = testLabel.ios.text;
        }
        TKUnit.assert(actualNative === expectedValue, "Expected: " + expectedValue + ", Actual: " + actualNative);
    }

    helper.buildUIAndRunTest(label, test);
}

export var test_measuredWidth_is_not_clipped = function () {
    var label = new LabelModule.Label();
    label.horizontalAlignment = "left";
    label.text = "i";
    label.fontSize = 9;

    var test = function (views: Array<view.View>) {

        TKUnit.waitUntilReady(() => { return label.isLayoutValid; });

        var expectedValue = 3;
        var measuredWidth = label.getMeasuredWidth();
        TKUnit.assertEqual(measuredWidth, expectedValue, "measuredWidth should not be rounded down.");
    }

    helper.buildUIAndRunTest(label, test);
}

export var test_Set_TextWrap_TNS = function () {
    // <snippet module="ui/label" title="Label">
    // ### How to turn on text wrapping for a label
    // ``` JavaScript
    var label = new LabelModule.Label();
    label.textWrap = true;
    // ```
    // </snippet>

    var actual = label._getValue(LabelModule.Label.textWrapProperty);
    TKUnit.assert(actual === true, "Expected: " + true + ", Actual: " + actual);
}

export var test_Set_TextWrap_Native = function () {
    var label = new LabelModule.Label();

    var test = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label>views[0];

        testLabel.textWrap = true;
        var expectedLineBreakMode;
        var expectedLinesNumber;
        var actualLineBreakMode;
        var actualLinesNumber;
        var actualEllipsize;
        var actualHorizontalScrolling;
        var actualTransformationMethod;

        if (testLabel.android) {
            actualEllipsize = testLabel.android.getEllipsize();
            actualLinesNumber = testLabel.android.getLineCount();
            actualHorizontalScrolling = testLabel.android.canScrollHorizontally(-1) || testLabel.android.canScrollHorizontally(1);
            actualTransformationMethod = testLabel.android.getTransformationMethod();
            TKUnit.assert(actualEllipsize === null, "Expected: " + null + ", Actual: " + actualEllipsize);
            TKUnit.assert(actualLinesNumber === 0, "Expected: " + 0 + ", Actual: " + actualLinesNumber);
            TKUnit.assert(actualHorizontalScrolling === false, "Expected: " + false + ", Actual: " + actualHorizontalScrolling);
            TKUnit.assert(actualTransformationMethod === null, "Expected: " + null + ", Actual: " + actualTransformationMethod);
        }
        else {
            expectedLineBreakMode = NSLineBreakMode.NSLineBreakByWordWrapping;
            expectedLinesNumber = 0;
            actualLineBreakMode = testLabel.ios.lineBreakMode;
            actualLinesNumber = testLabel.ios.numberOfLines;

            TKUnit.assert(actualLineBreakMode === expectedLineBreakMode, "Expected: " + expectedLineBreakMode + ", Actual: " + actualLineBreakMode);
            TKUnit.assert(actualLinesNumber === expectedLinesNumber, "Expected: " + expectedLinesNumber + ", Actual: " + actualLinesNumber);
        }
    }

    helper.buildUIAndRunTest(label, test);
}

export var test_Set_TextWrapFirstTrueThenFalse_Native = function () {
    var label = new LabelModule.Label();

    var test = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label>views[0];

        testLabel.textWrap = true;
        label.textWrap = false;

        var expectedLineBreakMode;
        var expectedLinesNumber;
        var actualLineBreakMode;
        var actualLinesNumber;
        var actualEllipsize;
        var actualHorizontalScrolling;
        var actualTransformationMethod;

        if (testLabel.android) {
            actualEllipsize = testLabel.android.getEllipsize();
            actualLinesNumber = testLabel.android.getLineCount();
            actualHorizontalScrolling = testLabel.android.canScrollHorizontally(-1) || testLabel.android.canScrollHorizontally(1);
            actualTransformationMethod = testLabel.android.getTransformationMethod();
            TKUnit.assert(actualEllipsize === android.text.TextUtils.TruncateAt.END, "Expected: " + android.text.TextUtils.TruncateAt.END + ", Actual: " + actualEllipsize);
            TKUnit.assert(actualLinesNumber === 0, "Expected: " + 0 + ", Actual: " + actualLinesNumber);
            TKUnit.assert(actualHorizontalScrolling === false, "Expected: " + false + ", Actual: " + actualHorizontalScrolling);
            TKUnit.assert(("" + actualTransformationMethod).indexOf("SingleLineTransformationMethod") > -1, "Expected: SingleLineTransformationMethod, Actual: " + actualTransformationMethod);
        }
        else {
            expectedLineBreakMode = NSLineBreakMode.NSLineBreakByTruncatingTail;
            expectedLinesNumber = 1;
            actualLineBreakMode = testLabel.ios.lineBreakMode;
            actualLinesNumber = testLabel.ios.numberOfLines;

            TKUnit.assert(actualLineBreakMode === expectedLineBreakMode, "Expected: " + expectedLineBreakMode + ", Actual: " + actualLineBreakMode);
            TKUnit.assert(actualLinesNumber === expectedLinesNumber, "Expected: " + expectedLinesNumber + ", Actual: " + actualLinesNumber);
        }
    }

    helper.buildUIAndRunTest(label, test);
}

export var test_SetStyleProperties_via_css_class_Native = function () {
    var label = new LabelModule.Label();

    var fontSize = 14;
    var color = "#ffff0000";
    var backgroundColor = "#ff00ff00";
    var testCss = [".title {background-color: ", backgroundColor, "; ",
        "color: ", color, "; ",
        "font-size: ", fontSize, ";}"].join("");

    // <snippet module="ui/label" title="Label">
    // ### How to style a label via css class
    // ``` JavaScript
    label.text = "The quick brown fox jumps over the lazy dog.";
    label.cssClass = "title";
    //// after that all we have to do is to set a similar css entry within parent page css property
    //// label.parentPage.css = ".title {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
    // ```
    // </snippet>

    var actualTextSize;
    var expSize;
    var actualColors;
    var expColor;
    var normalColor;
    var actualBackgroundColor;
    var expBackgroundColor;

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label>views[0];
        
        if (testLabel.android) {
            actualTextSize = testLabel.android.getTextSize();
            //expSize = helper.convertSizeToDeviceIndependentPixels(testLabel.android.getContext(), fontSize);
            var density = utils.layout.getDisplayDensity();
            expSize = fontSize * density;
            TKUnit.assert(actualTextSize === expSize, "Expected: " + expSize + ", Actual: " + actualTextSize);

            actualColors = testLabel.android.getTextColors();
            expColor = android.graphics.Color.parseColor(color);
            normalColor = actualColors.getDefaultColor()
            TKUnit.assert(normalColor, "Expected: " + expColor + ", Actual: " + normalColor);

            actualBackgroundColor = (<android.graphics.drawable.ColorDrawable>testLabel.android.getBackground()).getColor();
            expBackgroundColor = android.graphics.Color.parseColor(backgroundColor);
            TKUnit.assert(actualBackgroundColor === expBackgroundColor, "Expected: " + expBackgroundColor + ", Actual: " + actualBackgroundColor);
        }
        else {
            // iOS
            actualTextSize = testLabel.ios.font.pointSize;
            TKUnit.assert(actualTextSize === fontSize, "Expected: " + fontSize + ", Actual: " + actualTextSize);

            normalColor = utils.ios.getColor(testLabel.ios.textColor);
            expColor = new colorModule.Color(color);
            TKUnit.assert(normalColor.hex === expColor.hex, "Expected: " + expColor.hex + ", Actual: " + normalColor.hex);

            actualBackgroundColor = utils.ios.getColor(testLabel.ios.backgroundColor);
            expBackgroundColor = new colorModule.Color(backgroundColor);
            TKUnit.assert(actualBackgroundColor.hex === expBackgroundColor.hex, "Expected: " + expBackgroundColor.hex + ", Actual: " + actualBackgroundColor.hex);
        }
    }

    helper.buildUIAndRunTest(label, testFunc, testCss);
}

export var test_SetStyleProperties_via_css_type_TNS = function () {
    var label = new LabelModule.Label();
    var fontSize = 14;
    var color = "#10C2B0";
    var backgroundColor = "#C6C6C6";
    var testCss = ["label {background-color: ", backgroundColor, "; ",
        "color: ", color, "; ",
        "font-size: ", fontSize, ";}"].join("");

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label> views[0];

        // <snippet module="ui/label" title="Label">
        // ### How to style a label via css type
        // ``` JavaScript
        testLabel.text = "The quick brown fox jumps over the lazy dog.";
        //// in order to style label with a "type style scope" just put a similar css entry
        //// testLabel.parentPage.css = "label {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
        //// all labels within the parent page will be styled according to css values
        // ```
        // </snippet>
        var expectedBackgroundColor = new colorModule.Color(backgroundColor);
        var actualBackgroundColor = testLabel.style.backgroundColor;
        TKUnit.assert(expectedBackgroundColor.hex === actualBackgroundColor.hex, "Expected: " + expectedBackgroundColor.hex + ", Actual: " + actualBackgroundColor.hex);

        var expectedColor = new colorModule.Color(color);
        var actualColor = testLabel.style.color;
        TKUnit.assert(expectedColor.hex === actualColor.hex, "Expected: " + expectedColor.hex + ", Actual: " + actualColor.hex);

        var actualFontSize = testLabel.style.fontSize;
        TKUnit.assert(14 === actualFontSize, "Expected: " + fontSize + ", Actual: " + actualFontSize);
    }

    helper.buildUIAndRunTest(label, testFunc, testCss);
}

export var test_SetStyleProperties_via_css_id = function () {
    var label = new LabelModule.Label();
    var fontSize = 14;
    var color = "#10C2B0";
    var backgroundColor = "#C6C6C6";
    var testCss = ["#testLabel {background-color: ", backgroundColor, "; ",
        "color: ", color, "; ",
        "font-size: ", fontSize, ";}"].join("");

    // <snippet module="ui/label" title="Label">
    // ### How to style a label via css control identifier
    // ``` JavaScript
    label.text = "The quick brown fox jumps over the lazy dog.";
    label.id = "testLabel";
    //// after that all we have to do is to set a similar css entry within parent page css property
    //// label.parentPage.css = "#testLabel {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
    // ```
    // </snippet>

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label> views[0];

        var expectedBackgroundColor = new colorModule.Color(backgroundColor);
        var actualBackgroundColor = testLabel.style.backgroundColor;
        TKUnit.assert(expectedBackgroundColor.hex === actualBackgroundColor.hex, "Expected: " + expectedBackgroundColor.hex + ", Actual: " + actualBackgroundColor.hex);

        var expectedColor = new colorModule.Color(color);
        var actualColor = testLabel.style.color;
        TKUnit.assert(expectedColor.hex === actualColor.hex, "Expected: " + expectedColor.hex + ", Actual: " + actualColor.hex);

        var actualFontSize = testLabel.style.fontSize;
        TKUnit.assert(fontSize === actualFontSize, "Expected: " + fontSize + ", Actual: " + actualFontSize);
    }

    helper.buildUIAndRunTest(label, testFunc, testCss);
}

export var test_BindingToText = function () {
    // <snippet module="ui/label" title="Label">
    // ### How to bind text property of a label to an observable model
    // ``` JavaScript
    var label = new LabelModule.Label();
    var expValue = "Expected Value";
    var sourceModel = new observableModule.Observable();
    var bindingOptions: bindable.BindingOptions = {
        sourceProperty: "sourceProperty",
        targetProperty: "text"
    };
    label.bind(bindingOptions, sourceModel);
    sourceModel.set("sourceProperty", expValue);
    //// console.log(label.text); --> prints: "Expected Value"
    // ```
    // </snippet>

    TKUnit.assert(label.text === expValue, "Expected: " + expValue + ", Actual: " + label.text);
}

export var test_BindingToText_Native = function () {
    var label = new LabelModule.Label();

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label> views[0];
        var expValue = "Expected Value";
        var sourceModel = new observableModule.Observable();
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        sourceModel.set("sourceProperty", expValue);
        testLabel.bind(bindingOptions, sourceModel);

        var actualNative;
        if (testLabel.android) {
            actualNative = testLabel.android.getText();
        }
        else if (testLabel.ios) {
            actualNative = testLabel.ios.text;
        }
        TKUnit.assert(actualNative === expValue, "Expected: " + expValue + ", Actual: " + actualNative);
    }

    helper.buildUIAndRunTest(label, testFunc);
}

export var test_BindingToText_WithBindingContext = function () {
    var label = new LabelModule.Label();

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label> views[0];

        var firstExpValue = "Expected Value";
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        testLabel.bind(bindingOptions);
        var parentPage = <page.Page>views[1];
        var firstSourceObject = new observableModule.Observable();
        firstSourceObject.set("sourceProperty", firstExpValue);

        parentPage.bindingContext = firstSourceObject;
        TKUnit.assert(testLabel.text === firstExpValue, "Expected: " + firstExpValue + ", Actual: " + testLabel.text);

        var secondExpValue = "Second value";
        var secondSourceObject = new observableModule.Observable();
        secondSourceObject.set("sourceProperty", secondExpValue);
        parentPage.bindingContext = secondSourceObject;

        TKUnit.assert(testLabel.text === secondExpValue, "Expected: " + secondExpValue + ", Actual: " + testLabel.text);
    }

    helper.buildUIAndRunTest(label, testFunc);
}

export var test_BindingToText_BindingContext_SetingLocalValue = function () {
    var label = new LabelModule.Label();

    var testFunc = function (views: Array<view.View>) {
        var testLabel = <LabelModule.Label> views[0];

        var firstExpValue = "Expected Value";
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        testLabel.bind(bindingOptions);
        var parentPage = <page.Page>views[1];
        var firstSourceObject = new observableModule.Observable();
        firstSourceObject.set("sourceProperty", firstExpValue);

        parentPage.bindingContext = firstSourceObject;
        TKUnit.assert(testLabel.text === firstExpValue, "Expected: " + firstExpValue + ", Actual: " + testLabel.text);

        var secondExpValue = "Second value";
        testLabel.text = secondExpValue;
        TKUnit.assert(testLabel.text === secondExpValue, "Expected: " + secondExpValue + ", Actual: " + testLabel.text);

        firstSourceObject.set("sourceProperty", "some value");
        // after setting a value one way binding should be gone.
        TKUnit.assert(testLabel.text === secondExpValue, "Expected: " + secondExpValue + ", Actual: " + testLabel.text);
    }

    helper.buildUIAndRunTest(label, testFunc);
}

var _createLabelFunc = function (): LabelModule.Label {
    var label = new LabelModule.Label();
    label.text = "Label";
    return label;
}

var expectedTextAlignment = enums.TextAlignment.right;
export var testLocalTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        var page = <page.Page>views[1];
        page.css = "label { text-align: " + expectedTextAlignment + "; }";

        var actualResult = view.style.textAlignment;
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testLocalTextAlignmentFromCssWhenAddingCss = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        var page = <page.Page>views[1];
        page.addCss("label { text-align: " + expectedTextAlignment + "; }");

        var actualResult = view.style.textAlignment;
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);

        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");
        TKUnit.assert(view.style.textAlignment === view.style.textAlignment, "Actual: " + view.style.textAlignment + "; Expected: " + view.style.textAlignment);
    });
}

export var testLocalTextAlignmentFromCssWhenAddingCssAllSelectorsAreApplied = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        view.id = "testLabel";
        var page = <page.Page>views[1];
        page.addCss("#testLabel { text-align: " + expectedTextAlignment + "; }");
        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");

        var actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testLocalTextAlignmentFromCssWhenAddingCssFileAllSelectorsAreApplied = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        view.id = "testLabel";
        var page = <page.Page>views[1];
        page.addCss("#testLabel { text-align: " + expectedTextAlignment + "; }");
        page.addCssFile(fs.path.join(__dirname, "label-tests.css"));

        var actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
        TKUnit.assert(view.style.backgroundColor.hex === "#FF0000", "Actual: " + view.style.backgroundColor.hex + "; Expected: #FF0000");
    });
}

export var testNativeTextAlignmentFromCss = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        var page = <page.Page>views[1];
        page.css = "label { text-align: " + expectedTextAlignment + "; }";

        var actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testNativeTextAlignmentFromLocal = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        view.style.textAlignment = expectedTextAlignment;

        var actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult === expectedTextAlignment, "Actual: " + actualResult + "; Expected: " + expectedTextAlignment);
    });
}

export var testErrorMessageWhenWrongCssIsAddedWithFile = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        view.id = "testLabel";
        var page = <page.Page>views[1];
        errorMessage = undefined;
        page.addCssFile(fs.path.join(__dirname, "label-tests-wrong.css"));

        TKUnit.assertNotEqual(errorMessage, undefined);
    });
    
}

export var testErrorMessageWhenWrongCssIsAdded = function () {
    helper.buildUIAndRunTest(_createLabelFunc(), function (views: Array<view.View>) {
        var view = <LabelModule.Label>views[0];
        view.id = "testLabel";
        var page = <page.Page>views[1];
        errorMessage = undefined;
        page.addCss("label { < !--Test wrong comment-- > background-color: red; }");

        TKUnit.assertNotEqual(errorMessage, undefined);
    });
}
