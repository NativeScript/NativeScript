import * as TKUnit from "../../TKUnit";
import testModule = require("../../ui-test");
import styling = require("ui/styling");

//>> label-require
import LabelModule = require("ui/label");
// << label-require

import types = require("utils/types");
import colorModule = require("color");
import utils = require("utils/utils");
import observableModule = require("data/observable");
import bindable = require("ui/core/bindable");
import textBase = require("ui/text-base");
import enums = require("ui/enums");
import labelTestsNative = require("./label-tests-native");
import fs = require("file-system");

import {StackLayout} from "ui/layouts/stack-layout";
import {GridLayout} from "ui/layouts/grid-layout";
import {isIOS} from "platform";
import {Label} from "ui/label";
import {LayoutBase} from  "ui/layouts/layout-base";
import * as helper from "../helper";
import viewModule = require("ui/core/view");
import {Page} from "ui/page";

export class LabelTest extends testModule.UITest<LabelModule.Label> {

    public create(): LabelModule.Label {
        var label = new LabelModule.Label();
        label.text = "Label";
        return label;
    }

    public test_Label_Members() {
        var label = new LabelModule.Label();
        TKUnit.assert(types.isDefined(label.text), "Label.text is not defined");
        TKUnit.assert(types.isDefined(label.textWrap), "Label.textWrap is not defined");
    }

    public snippet_Set_Text_TNS() {
        // >> label-settext
        var label = new LabelModule.Label();
        var expectedValue = "Expected Value";
        label.text = expectedValue;
        // << label-settext
    }

    public snippet_Set_TextWrap_TNS() {
        // >> label-textwrap
        var label = new LabelModule.Label();
        label.textWrap = true;
        // << label-textwrap
    }

    public test_Set_Text_TNS() {
        var label = this.testView;
        var expectedValue = "Expected Value";
        label.text = expectedValue;

        var actual = label._getValue(textBase.TextBase.textProperty);
        TKUnit.assertEqual(actual, expectedValue, "Text not equal");
    }

    public test_Set_Text_Native() {
        var testLabel = this.testView;
        var expectedValue = "Expected Value";

        testLabel.text = expectedValue;
        var actualNative;
        if (testLabel.ios) {
            actualNative = testLabel.ios.text;
        }
        else {
            this.waitUntilTestElementIsLoaded();
            actualNative = testLabel.android.getText().toString();
        }

        TKUnit.assertEqual(actualNative, expectedValue, "Native text not equal");
    }

    public test_Set_Text_Native_Null() {
        var testLabel = this.testView;
        var expectedValue = "";

        testLabel.text = null;
        var actualNative;
        if (testLabel.ios) {
            actualNative = testLabel.ios.text;
        }
        else {
            this.waitUntilTestElementIsLoaded();
            actualNative = testLabel.android.getText().toString();
        }

        TKUnit.assertEqual(actualNative, expectedValue, "Native text not equal");
    }

    public test_Set_Text_Native_Undefined() {
        var testLabel = this.testView;
        var expectedValue = "";

        testLabel.text = undefined;
        var actualNative;
        if (testLabel.ios) {
            actualNative = testLabel.ios.text;
        }
        else {
            this.waitUntilTestElementIsLoaded();
            actualNative = testLabel.android.getText().toString();
        }

        TKUnit.assertEqual(actualNative, expectedValue, "Native text not equal");
    }

    public test_Set_BackgroundColor_TNS() {
        var label = this.testView;
        var expectedValue = new colorModule.Color("Red");
        label.backgroundColor = expectedValue;

        var actual = label.style._getValue(styling.properties.backgroundColorProperty);
        TKUnit.assertEqual(actual, expectedValue, "BackgroundColor not equal");
    }

    public test_Set_BackgroundColor_Native() {
        var testLabel = this.testView;
        var expectedValue = new colorModule.Color("Red");

        testLabel.backgroundColor = expectedValue;

        if (testLabel.android) {
            this.waitUntilTestElementIsLoaded();
        }
        var actualNative = labelTestsNative.getNativeBackgroundColor(testLabel);

        TKUnit.assertEqual(actualNative, expectedValue);
    }

    public test_measuredWidth_is_not_clipped() {
        var label = this.testView;
        label.horizontalAlignment = "left";
        label.text = "i";
        label.fontSize = 9;

        if (label.ios) {

            this.waitUntilTestElementLayoutIsValid();

            var expectedValue = 3;
            var measuredWidth = label.getMeasuredWidth();
            TKUnit.assertEqual(measuredWidth, expectedValue, "measuredWidth should not be rounded down.");
        }
    }

    public test_Set_TextWrap_Native() {
        var testLabel = this.testView;
        testLabel.textWrap = true;
        this.waitUntilTestElementLayoutIsValid();

        var expectedLineBreakMode;
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
            TKUnit.assertNull(actualEllipsize);
            TKUnit.assertEqual(actualLinesNumber, 1, "LinesNumber");
            TKUnit.assertEqual(actualHorizontalScrolling, false, "HorizontalScrolling");
            TKUnit.assertNull(actualTransformationMethod, "TransformationMethod");
        }
        else {
            expectedLineBreakMode = NSLineBreakMode.ByWordWrapping;
            actualLineBreakMode = testLabel.ios.lineBreakMode;
            actualLinesNumber = testLabel.ios.numberOfLines;

            TKUnit.assertEqual(actualLineBreakMode, expectedLineBreakMode, "LineBreakMode");
            TKUnit.assertEqual(actualLinesNumber, 0, "LinesNumber");
        }
    }

    public test_Set_TextWrapFirstTrueThenFalse_Native() {
        var testLabel = this.testView;
        testLabel.textWrap = true;
        this.waitUntilTestElementLayoutIsValid();

        testLabel.textWrap = false;
        this.waitUntilTestElementLayoutIsValid();

        var expectedLineBreakMode;
        var expectedLinesNumber = 1;
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

            TKUnit.assertEqual(actualEllipsize, android.text.TextUtils.TruncateAt.END, "Ellipsize");
            TKUnit.assertEqual(actualHorizontalScrolling, false, "HorizontalScrolling");
            TKUnit.assert(("" + actualTransformationMethod).indexOf("SingleLineTransformationMethod") > -1, "Expected: SingleLineTransformationMethod, Actual: " + actualTransformationMethod);
        }
        else {
            expectedLineBreakMode = NSLineBreakMode.ByTruncatingTail;
            actualLineBreakMode = testLabel.ios.lineBreakMode;
            actualLinesNumber = testLabel.ios.numberOfLines;

            TKUnit.assertEqual(actualLineBreakMode, expectedLineBreakMode, "LineBreakMode");
        }

        TKUnit.assertEqual(actualLinesNumber, expectedLinesNumber, "LinesNumber");
    }

    public test_SetStyleProperties_via_css_class_Native() {
        var label = this.testView;

        var fontSize = 14;
        var color = "#ffff0000";
        var backgroundColor = "#ff00ff00";
        var testCss = [".title {background-color: ", backgroundColor, "; ",
            "color: ", color, "; ",
            "font-size: ", fontSize, ";}"].join("");

        // >> label-cssclass
        label.text = "The quick brown fox jumps over the lazy dog.";
        label.className = "title";
        // after that all we have to do is to set a similar css entry within parent page css property
        // label.parentPage.css = ".title {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
        // << label-cssclass

        var actualTextSize;
        var expSize;
        var actualColors;
        var expColor;
        var normalColor;
        var actualBackgroundColor;
        var expBackgroundColor;

        this.testPage.css = testCss;
        this.waitUntilTestElementIsLoaded();
        var testLabel = label;

        if (testLabel.android) {
            actualTextSize = testLabel.android.getTextSize();
            var density = utils.layout.getDisplayDensity();
            expSize = fontSize * density;
            TKUnit.assertAreClose(actualTextSize, expSize, 0.1, "Wrong native FontSize");

            actualColors = testLabel.android.getTextColors();
            expColor = android.graphics.Color.parseColor(color);
            normalColor = actualColors.getDefaultColor()
            TKUnit.assert(normalColor, "Expected: " + expColor + ", Actual: " + normalColor);

            var bkg = (<org.nativescript.widgets.BorderDrawable>testLabel.android.getBackground());
            actualBackgroundColor = bkg.getBackgroundColor();
            expBackgroundColor = android.graphics.Color.parseColor(backgroundColor);
            TKUnit.assertEqual(actualBackgroundColor, expBackgroundColor);
        }
        else {
            // iOS
            actualTextSize = testLabel.ios.font.pointSize;
            TKUnit.assertEqual(actualTextSize, fontSize, "Wrong native FontSize");

            normalColor = utils.ios.getColor(testLabel.ios.textColor);
            expColor = new colorModule.Color(color);
            TKUnit.assertEqual(normalColor.hex, expColor.hex);

            var cgColor = (<UILabel>testLabel.ios).layer.backgroundColor;
            var uiColor = UIColor.colorWithCGColor(cgColor);
            actualBackgroundColor = utils.ios.getColor(uiColor);
            expBackgroundColor = new colorModule.Color(backgroundColor);
            TKUnit.assertEqual(actualBackgroundColor.hex, expBackgroundColor.hex);
        }
    }

    public test_SetStyleProperties_via_css_type_TNS() {
        var label = this.testView;
        var fontSize = 14;
        var color = "#10C2B0";
        var backgroundColor = "#C6C6C6";
        var testCss = ["label {background-color: ", backgroundColor, "; ",
            "color: ", color, "; ",
            "font-size: ", fontSize, ";}"].join("");

        this.testPage.css = testCss;
        this.waitUntilTestElementIsLoaded();

        // >> label-cssclass-type
        label.text = "The quick brown fox jumps over the lazy dog.";
        // in order to style label with a "type style scope" just put a similar css entry
        // testLabel.parentPage.css = "label {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
        // all labels within the parent page will be styled according to css values
        // << label-cssclass-type
        var expectedBackgroundColor = new colorModule.Color(backgroundColor);
        var actualBackgroundColor = label.style.backgroundColor;
        TKUnit.assertEqual(expectedBackgroundColor.hex, actualBackgroundColor.hex);

        var expectedColor = new colorModule.Color(color);
        var actualColor = label.style.color;
        TKUnit.assertEqual(expectedColor.hex, actualColor.hex);

        var actualFontSize = label.style.fontSize;
        TKUnit.assertEqual(actualFontSize, 14);
    }

    public test_SetStyleProperties_via_css_id() {
        var label = this.testView;
        var fontSize = 14;
        var color = "#10C2B0";
        var backgroundColor = "#C6C6C6";
        var testCss = ["#testLabel {background-color: ", backgroundColor, "; ",
            "color: ", color, "; ",
            "font-size: ", fontSize, ";}"].join("");

        this.testPage.css = testCss;
        this.waitUntilTestElementIsLoaded();

        // >> label-css-identifier
        label.text = "The quick brown fox jumps over the lazy dog.";
        label.id = "testLabel";
        // after that all we have to do is to set a similar css entry within parent page css property
        // label.parentPage.css = "#testLabel {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
        // << label-css-identifier

        var expectedBackgroundColor = new colorModule.Color(backgroundColor);
        var actualBackgroundColor = label.style.backgroundColor;
        TKUnit.assertEqual(expectedBackgroundColor.hex, actualBackgroundColor.hex);

        var expectedColor = new colorModule.Color(color);
        var actualColor = label.style.color;
        TKUnit.assertEqual(expectedColor.hex, actualColor.hex);

        var actualFontSize = label.style.fontSize;
        TKUnit.assertEqual(fontSize, actualFontSize);
    }

    public test_BindingToText() {
        // >> label-observable
        var label = new LabelModule.Label();
        var expValue = "Expected Value";
        var sourceModel = new observableModule.Observable();
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        label.bind(bindingOptions, sourceModel);
        sourceModel.set("sourceProperty", expValue);
        // console.log(label.text); --> prints: "Expected Value"
        // << label-observable

        TKUnit.assertEqual(label.text, expValue);
    }

    public test_BindingToText_Native() {
        var label = this.testView;
        this.waitUntilTestElementIsLoaded();

        var expValue = "Expected Value";
        var sourceModel = new observableModule.Observable();
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        sourceModel.set("sourceProperty", expValue);
        label.bind(bindingOptions, sourceModel);

        var actualNative;
        if (label.android) {
            actualNative = label.android.getText();
        }
        else if (label.ios) {
            actualNative = label.ios.text;
        }

        TKUnit.assertEqual(actualNative, expValue);
    }

    public test_BindingToText_WithBindingContext() {
        var label = this.testView;
        this.waitUntilTestElementIsLoaded();

        var firstExpValue = "Expected Value";
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        label.bind(bindingOptions);
        var firstSourceObject = new observableModule.Observable();
        firstSourceObject.set("sourceProperty", firstExpValue);

        this.testPage.bindingContext = firstSourceObject;
        TKUnit.assertEqual(label.text, firstExpValue);

        var secondExpValue = "Second value";
        var secondSourceObject = new observableModule.Observable();
        secondSourceObject.set("sourceProperty", secondExpValue);
        this.testPage.bindingContext = secondSourceObject;

        TKUnit.assertEqual(label.text, secondExpValue);
    }

    public test_BindingToText_BindingContext_SetingLocalValue() {
        var label = this.testView;
        this.waitUntilTestElementIsLoaded();

        var firstExpValue = "Expected Value";
        var bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        label.bind(bindingOptions);
        var firstSourceObject = new observableModule.Observable();
        firstSourceObject.set("sourceProperty", firstExpValue);

        this.testPage.bindingContext = firstSourceObject;
        TKUnit.assertEqual(label.text, firstExpValue);

        var secondExpValue = "Second value";
        label.text = secondExpValue;
        TKUnit.assertEqual(label.text, secondExpValue);

        firstSourceObject.set("sourceProperty", "some value");
        // after setting a value one way binding should be gone.
        TKUnit.assertEqual(label.text, secondExpValue);
    }

    private expectedTextAlignment = enums.TextAlignment.right;
    public testLocalTextAlignmentFromCss() {
        var label = this.testView;
        this.testPage.css = "label { text-align: " + this.expectedTextAlignment + "; }";
        this.waitUntilTestElementIsLoaded();
        TKUnit.assertEqual(label.style.textAlignment, this.expectedTextAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCss() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();
        page.addCss("label { text-align: " + this.expectedTextAlignment + "; }");

        var actualResult = view.style.textAlignment;
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);

        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");
        TKUnit.assertEqual(view.style.textAlignment, view.style.textAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCssAllSelectorsAreApplied() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("#testLabel { text-align: " + this.expectedTextAlignment + "; }");
        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");

        var actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCssFileAllSelectorsAreApplied() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("#testLabel { text-align: " + this.expectedTextAlignment + "; }");
        page.addCssFile(fs.path.join(__dirname, "label-tests.css"));

        var actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
        TKUnit.assertEqual(view.style.backgroundColor.hex, "#FF0000");
    }

    public testNativeTextAlignmentFromCss() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        page.css = "label { text-align: " + this.expectedTextAlignment + "; }";
        var actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult, this.expectedTextAlignment);
    }

    public testNativeTextAlignmentFromLocal() {
        var view = this.testView;
        this.waitUntilTestElementIsLoaded();

        view.style.textAlignment = this.expectedTextAlignment;

        var actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
    }

    public testErrorMessageWhenWrongCssIsAddedWithFile() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCssFile(fs.path.join(__dirname, "label-tests-wrong.css"));
        TKUnit.assertNotEqual(this.errorMessage, undefined);
    }

    public testErrorMessageWhenWrongCssIsAdded() {
        var view = this.testView;
        var page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("label { < !--Test wrong comment-- > background-color: red; }");
        TKUnit.assertNotEqual(this.errorMessage, undefined);
    }

    private requestLayoutFixture(expectRequestLayout: boolean, initialValue: string, setup: (label: Label) => LayoutBase): void {
        if (!isIOS) {
            return;
        }

        let label = new Label();
        label.text = initialValue;
        let host = setup(label);

        host.addChild(label);

        let mainPage = helper.getCurrentPage();
        mainPage.content = host;
        TKUnit.waitUntilReady(() => host.isLoaded);

        let called = false;
        label.requestLayout = () => called = true;
        // changing text actually could request layout
        label.text = initialValue + " Again";

        if (expectRequestLayout) {
            TKUnit.assertTrue(called, "label.requestLayout should be called.");
        } else {
            TKUnit.assertFalse(called, "image.requestLayout should not be called.");
        }
    }

    public test_SettingTextWhenInFixedSizeGridShouldNotRequestLayout() {
        this.requestLayoutFixture(false, "", () => {
            let host = new GridLayout();
            host.width = 100;
            host.height = 100;
            return host;
        });
    }

    public test_ChangingTextWhenInFixedSizeGridShouldNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", () => {
            let host = new GridLayout();
            host.width = 100;
            host.height = 100;
            return host;
        });
    }

    public test_SettingTextWhenFixedWidthAndHeightDoesNotRequestLayout() {
        this.requestLayoutFixture(false, "", label => {
            let host = new StackLayout();
            label.width = 100;
            label.height = 100;
            return host;
        });
    };

    public test_ChangingTextWhenFixedWidthAndHeightDoesNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", label => {
            let host = new StackLayout();
            label.width = 100;
            label.height = 100;
            return host;
        });
    };

    public test_SettingTextWhenSizedToContentShouldInvalidate() {
        this.requestLayoutFixture(true, "", () => {
            let host = new StackLayout();
            host.orientation = "horizontal";
            return host;
        });
    };

    public test_ChangingTextWhenSizedToContentShouldInvalidate() {
        this.requestLayoutFixture(true, "Hello World", () => {
            let host = new StackLayout();
            host.orientation = "horizontal";
            return host;
        });
    };

    public test_SettingTextOnSingleLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldRequestLayout() {
        this.requestLayoutFixture(true, "", () => {
            let host = new StackLayout();
            host.width = 100;
            return host;
        });
    }

    public test_ChangingTextOnSingleLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", () => {
            let host = new StackLayout();
            host.width = 100;
            return host;
        });
    }

    public test_SettingTextOnMultilineLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldRequestLayout() {
        this.requestLayoutFixture(true, "", label => {
            label.textWrap = true;
            let host = new StackLayout();
            host.width = 100;
            return host;
        });
    }

    public test_ChangingTextOnMultilineLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldRequestLayout() {
        this.requestLayoutFixture(true, "Hello World", label => {
            label.textWrap = true;
            let host = new StackLayout();
            host.width = 100;
            return host;
        });
    }
}

export function createTestCase(): LabelTest {
    return new LabelTest();
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
    let view = new LabelModule.Label();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        view.text = "NormalText";
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");
        
        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
    });
}

export function test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
    let view = new LabelModule.Label();
    let formattedString = helper._generateFormattedString();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        view.formattedText = formattedString;
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");
        
        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
    });
}

export var test_applying_disabled_visual_State_when_label_is_disable = function () {
    let view = new Label();
    helper.buildUIAndRunTest(view, function (views: Array<viewModule.View>) {
        var view = <Label>views[0];
        var page = <Page>views[1];
        var expectedColor = "#ffff0000";
        page.css = "label:disabled { background-color: " + expectedColor + "; }";

        view.isEnabled = false;

        var actualResult = labelTestsNative.getNativeBackgroundColor(view);
        TKUnit.assert(actualResult.hex === expectedColor, "Actual: " + actualResult.hex + "; Expected: " + expectedColor);
    });
}