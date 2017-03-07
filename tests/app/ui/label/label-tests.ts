import * as TKUnit from "../../TKUnit";
import * as testModule from "../../ui-test";

//>> label-require
import * as LabelModule from "ui/label";
// << label-require

import * as types from "utils/types";
import * as colorModule from "color";
import * as utils from "utils/utils";
import * as observableModule from "data/observable";
import * as bindable from "ui/core/bindable";
import * as enums from "ui/enums";
import * as labelTestsNative from "./label-tests-native";
import * as fs from "file-system";

import { StackLayout } from "ui/layouts/stack-layout";
import { GridLayout } from "ui/layouts/grid-layout";
import { isIOS, isAndroid } from "platform";
import { Label } from "ui/label";
import { LayoutBase } from "ui/layouts/layout-base";
import * as helper from "../helper";

export class LabelTest extends testModule.UITest<LabelModule.Label> {

    public create(): LabelModule.Label {
        const label = new LabelModule.Label();
        label.text = "Label";
        return label;
    }

    public test_Label_Members() {
        const label = new LabelModule.Label();
        TKUnit.assert(types.isDefined(label.text), "Label.text is not defined");
        TKUnit.assert(types.isDefined(label.textWrap), "Label.textWrap is not defined");
    }

    public snippet_Set_Text_TNS() {
        // >> label-settext
        const label = new LabelModule.Label();
        const expectedValue = "Expected Value";
        label.text = expectedValue;
        // << label-settext
    }

    public snippet_Set_TextWrap_TNS() {
        // >> label-textwrap
        const label = new LabelModule.Label();
        label.textWrap = true;
        // << label-textwrap
    }

    public test_Set_Text_TNS() {
        const label = this.testView;
        const expectedValue = "Expected Value";
        label.text = expectedValue;
        TKUnit.assertEqual(label.text, expectedValue, "Text not equal");
    }

    public test_Set_Text_Native() {
        const testLabel = this.testView;
        const expectedValue = "Expected Value";

        testLabel.text = expectedValue;
        let actualNative;
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
        const testLabel = this.testView;
        const expectedValue = "";

        testLabel.text = null;
        let actualNative;
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
        const testLabel = this.testView;
        const expectedValue = "";

        testLabel.text = undefined;
        let actualNative;
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
        const label = this.testView;
        const expectedValue = new colorModule.Color("Red");
        label.backgroundColor = expectedValue;

        const actual = label.style.backgroundColor;
        TKUnit.assertEqual(actual, expectedValue, "BackgroundColor not equal");
    }

    public test_Set_BackgroundColor_Native() {
        const testLabel = this.testView;
        const expectedValue = new colorModule.Color("Red");

        testLabel.backgroundColor = expectedValue;

        if (testLabel.android) {
            this.waitUntilTestElementIsLoaded();
        }
        const actualNative = labelTestsNative.getNativeBackgroundColor(testLabel);

        TKUnit.assertEqual(actualNative, expectedValue);
    }

    public test_measuredWidth_is_not_clipped() {
        const label = this.testView;
        label.horizontalAlignment = "left";
        label.text = "i";
        label.fontSize = 9;

        if (label.ios) {
            this.waitUntilTestElementLayoutIsValid();
            let expectedValue = NSString.stringWithString("i").sizeWithAttributes(<any>{
                [NSFontAttributeName]: UIFont.systemFontOfSize(9)
            }).width;
            expectedValue = Math.ceil(utils.layout.toDevicePixels(expectedValue));
            const measuredWidth = label.getMeasuredWidth();
            TKUnit.assertEqual(measuredWidth, expectedValue, "measuredWidth should not be rounded down.");
        }
    }

    public test_Set_TextWrap_Native() {
        const testLabel = this.testView;
        testLabel.text = "this is very very very very very very very very very very very very very very very very very very very very very very very long text";
        testLabel.textWrap = true;
        this.waitUntilTestElementLayoutIsValid();

        if (isAndroid) {
            TKUnit.assertNull(testLabel.android.getEllipsize());
            TKUnit.assertTrue(testLabel.android.getLineCount() > 1, "LinesNumber");
            const actualHorizontalScrolling = testLabel.android.canScrollHorizontally(-1) || testLabel.android.canScrollHorizontally(1);
            TKUnit.assertFalse(actualHorizontalScrolling, "HorizontalScrolling");
            TKUnit.assertNull(testLabel.android.getTransformationMethod(), "TransformationMethod");
        }
        if (isIOS) {
            TKUnit.assertEqual(testLabel.ios.lineBreakMode, NSLineBreakMode.ByWordWrapping, "LineBreakMode");
            TKUnit.assertEqual(testLabel.ios.numberOfLines, 0, "LinesNumber");
        }
    }

    public test_Set_TextWrapFirstTrueThenFalse_Native() {
        const testLabel = this.testView;
        testLabel.text = "this is very very very very very very very very very very very very very very very very very very very very very very very long text";
        testLabel.textWrap = true;
        this.waitUntilTestElementLayoutIsValid();

        testLabel.textWrap = false;
        this.waitUntilTestElementLayoutIsValid();

        if (isAndroid) {
            TKUnit.assertEqual(testLabel.android.getEllipsize(), android.text.TextUtils.TruncateAt.END, "Ellipsize");
            const actualHorizontalScrolling = testLabel.android.canScrollHorizontally(-1) || testLabel.android.canScrollHorizontally(1);
            TKUnit.assertEqual(actualHorizontalScrolling, false, "HorizontalScrolling");
            TKUnit.assert(("" + testLabel.android.getTransformationMethod()).indexOf("SingleLineTransformationMethod") > -1, "Expected: SingleLineTransformationMethod, Actual: " + testLabel.android.getTransformationMethod());
            TKUnit.assertEqual(testLabel.android.getLineCount(), 1, "LinesNumber");

        }
        if (isIOS) {
            TKUnit.assertEqual(testLabel.ios.lineBreakMode, NSLineBreakMode.ByTruncatingTail, "LineBreakMode");
            TKUnit.assertEqual(testLabel.ios.numberOfLines, 1, "LinesNumber");
        }

    }

    public test_SetStyleProperties_via_css_class_Native() {
        const label = this.testView;

        const fontSize = 14;
        const color = "#FFFF0000";
        const backgroundColor = "#FF00FF00";
        const testCss = [".title {background-color: ", backgroundColor, "; ",
            "color: ", color, "; ",
            "font-size: ", fontSize, ";}"].join("");

        // >> label-cssclass
        label.text = "The quick brown fox jumps over the lazy dog.";
        label.className = "title";
        // after that all we have to do is to set a similar css entry within parent page css property
        // label.parentPage.css = ".title {background-color: #C6C6C6; color: #10C2B0; font-size: 14;}";
        // << label-cssclass

        let actualTextSize;
        let expSize;
        let actualColors;
        let expColor;
        let normalColor;
        let actualBackgroundColor;
        let expBackgroundColor;

        this.testPage.css = testCss;
        this.waitUntilTestElementIsLoaded();
        const testLabel = label;

        if (testLabel.android) {
            actualTextSize = testLabel.android.getTextSize();
            const density = utils.layout.getDisplayDensity();
            expSize = fontSize * density;
            TKUnit.assertAreClose(actualTextSize, expSize, 0.1, "Wrong native FontSize");

            actualColors = testLabel.android.getTextColors();
            expColor = android.graphics.Color.parseColor(color);
            normalColor = actualColors.getDefaultColor();
            TKUnit.assert(normalColor, "Expected: " + expColor + ", Actual: " + normalColor);

            const bkg = (<org.nativescript.widgets.BorderDrawable>testLabel.android.getBackground());
            actualBackgroundColor = bkg.getBackgroundColor();
            expBackgroundColor = android.graphics.Color.parseColor(backgroundColor);
            TKUnit.assertEqual(actualBackgroundColor, expBackgroundColor);
        }
        else {
            // iOS
            actualTextSize = testLabel.ios.font.pointSize;
            TKUnit.assertEqual(actualTextSize, fontSize, "Wrong native FontSize");

            normalColor = helper.getColor(testLabel.ios.textColor);
            expColor = new colorModule.Color(color);
            TKUnit.assertEqual(normalColor.hex, expColor.hex);

            const cgColor = (<UILabel>testLabel.ios).layer.backgroundColor;
            const uiColor = UIColor.colorWithCGColor(cgColor);
            actualBackgroundColor = helper.getColor(uiColor);
            expBackgroundColor = new colorModule.Color(backgroundColor);
            TKUnit.assertEqual(actualBackgroundColor.hex, expBackgroundColor.hex);
        }
    }

    public test_SetStyleProperties_via_css_type_TNS() {
        const label = this.testView;
        const fontSize = 14;
        const color = "#10C2B0";
        const backgroundColor = "#C6C6C6";
        const testCss = ["label {background-color: ", backgroundColor, "; ",
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
        const expectedBackgroundColor = new colorModule.Color(backgroundColor);
        const actualBackgroundColor = label.style.backgroundColor;
        TKUnit.assertEqual(expectedBackgroundColor.hex, actualBackgroundColor.hex);

        const expectedColor = new colorModule.Color(color);
        const actualColor = label.style.color;
        TKUnit.assertEqual(expectedColor.hex, actualColor.hex);

        const actualFontSize = label.style.fontSize;
        TKUnit.assertEqual(actualFontSize, 14);
    }

    public test_SetStyleProperties_via_css_id() {
        const label = this.testView;
        const fontSize = 14;
        const color = "#10C2B0";
        const backgroundColor = "#C6C6C6";
        const testCss = ["#testLabel {background-color: ", backgroundColor, "; ",
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

        const expectedBackgroundColor = new colorModule.Color(backgroundColor);
        const actualBackgroundColor = label.style.backgroundColor;
        TKUnit.assertEqual(expectedBackgroundColor.hex, actualBackgroundColor.hex);

        const expectedColor = new colorModule.Color(color);
        const actualColor = label.style.color;
        TKUnit.assertEqual(expectedColor.hex, actualColor.hex);

        const actualFontSize = label.style.fontSize;
        TKUnit.assertEqual(fontSize, actualFontSize);
    }

    public test_BindingToText() {
        // >> label-observable
        const label = new LabelModule.Label();
        const expValue = "Expected Value";
        const sourceModel = new observableModule.Observable();
        const bindingOptions: bindable.BindingOptions = {
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
        const label = this.testView;
        this.waitUntilTestElementIsLoaded();

        const expValue = "Expected Value";
        const sourceModel = new observableModule.Observable();
        const bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        sourceModel.set("sourceProperty", expValue);
        label.bind(bindingOptions, sourceModel);

        let actualNative;
        if (label.android) {
            actualNative = label.android.getText();
        }
        else if (label.ios) {
            actualNative = label.ios.text;
        }

        TKUnit.assertEqual(actualNative, expValue);
    }

    public test_BindingToText_WithBindingContext() {
        const label = this.testView;
        this.waitUntilTestElementIsLoaded();

        const firstExpValue = "Expected Value";
        const bindingOptions: bindable.BindingOptions = {
            sourceProperty: "sourceProperty",
            targetProperty: "text"
        };
        label.bind(bindingOptions);
        const firstSourceObject = new observableModule.Observable();
        firstSourceObject.set("sourceProperty", firstExpValue);

        this.testPage.bindingContext = firstSourceObject;
        TKUnit.assertEqual(label.text, firstExpValue);

        const secondExpValue = "Second value";
        const secondSourceObject = new observableModule.Observable();
        secondSourceObject.set("sourceProperty", secondExpValue);
        this.testPage.bindingContext = secondSourceObject;

        TKUnit.assertEqual(label.text, secondExpValue);
    }

    private expectedTextAlignment: "right" = "right";
    public testLocalTextAlignmentFromCss() {
        const label = this.testView;
        this.testPage.css = "label { text-align: " + this.expectedTextAlignment + "; }";
        this.waitUntilTestElementIsLoaded();
        TKUnit.assertEqual(label.style.textAlignment, this.expectedTextAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCss() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();
        page.addCss("label { text-align: " + this.expectedTextAlignment + "; }");

        const actualResult = view.style.textAlignment;
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);

        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");
        TKUnit.assertEqual(view.style.textAlignment, view.style.textAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCssAllSelectorsAreApplied() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("#testLabel { text-align: " + this.expectedTextAlignment + "; }");
        page.addCss("label { text-align: " + enums.TextAlignment.left + "; }");

        const actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
    }

    public testLocalTextAlignmentFromCssWhenAddingCssFileAllSelectorsAreApplied() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("#testLabel { text-align: " + this.expectedTextAlignment + "; }");
        page.addCssFile(fs.path.join(__dirname, "label-tests.css"));

        const actualResult = view.style.textAlignment;
        // actual result is taken from #testLabel tag, because it has a greater priority (id vs type).
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
        TKUnit.assertEqual(view.style.backgroundColor.hex, "#FF0000");
    }

    public testNativeTextAlignmentFromCss() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        page.css = "label { text-align: " + this.expectedTextAlignment + "; }";
        const actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assert(actualResult, this.expectedTextAlignment);
    }

    public testNativeTextAlignmentFromLocal() {
        const view = this.testView;
        this.waitUntilTestElementIsLoaded();

        view.style.textAlignment = this.expectedTextAlignment;

        const actualResult = labelTestsNative.getNativeTextAlignment(view);
        TKUnit.assertEqual(actualResult, this.expectedTextAlignment);
    }

    public testErrorMessageWhenWrongCssIsAddedWithFile() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCssFile(fs.path.join(__dirname, "label-tests-wrong.css"));
        TKUnit.assertNotEqual(this.errorMessage, undefined);
    }

    public testErrorMessageWhenWrongCssIsAdded() {
        const view = this.testView;
        const page = this.testPage;
        this.waitUntilTestElementIsLoaded();

        view.id = "testLabel";
        page.addCss("label { < !--Test wrong comment-- > background-color: red; }");
        TKUnit.assertNotEqual(this.errorMessage, undefined);
    }

    public test_applying_disabled_visual_State_when_label_is_disable = function () {
        let view = this.testView;
        let page = this.testPage;
        this.waitUntilTestElementIsLoaded();
        let expectedColor = "#FFFF0000";
        let expectedNormalizedColor = "#FF0000";

        page.css = "label:disabled { background-color: " + expectedColor + "; }";

        view.isEnabled = false;

        let actualResult = labelTestsNative.getNativeBackgroundColor(view);
        TKUnit.assert(actualResult.hex === expectedNormalizedColor, "Actual: " + actualResult.hex + "; Expected: " + expectedNormalizedColor);
    };

    public test_IntegrationTest_Transform_Decoration_Spacing_WithoutFormattedText_DoesNotCrash() {
        let view = this.testView;
        view.text = "NormalText";
        this.waitUntilTestElementIsLoaded();
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");

        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
    }

    public test_IntegrationTest_Transform_Decoration_Spacing_WithFormattedText_DoesNotCrash() {
        let view = this.testView;
        let formattedString = helper._generateFormattedString();
        this.waitUntilTestElementIsLoaded();
        view.formattedText = formattedString;
        view.setInlineStyle("text-transform: uppercase; text-decoration: underline; letter-spacing: 1;");

        TKUnit.assertEqual(view.style.textTransform, enums.TextTransform.uppercase, "TextTransform");
        TKUnit.assertEqual(view.style.textDecoration, enums.TextDecoration.underline, "TextDecoration");
        TKUnit.assertEqual(view.style.letterSpacing, 1, "LetterSpacing");
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
        this.requestLayoutFixture(false, "", label => {
            label.textWrap = false;
            let host = new GridLayout();
            host.width = 100;
            host.height = 100;
            return host;
        });
    }

    public test_ChangingTextWhenInFixedSizeGridShouldNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", label => {
            label.textWrap = false;
            let host = new GridLayout();
            host.width = 100;
            host.height = 100;
            return host;
        });
    }

    public test_SettingTextWhenFixedWidthAndHeightDoesNotRequestLayout() {
        this.requestLayoutFixture(false, "", label => {
            label.textWrap = false;
            let host = new StackLayout();
            label.width = 100;
            label.height = 100;
            return host;
        });
    };

    public test_ChangingTextWhenFixedWidthAndHeightDoesNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", label => {
            label.textWrap = false;
            let host = new StackLayout();
            label.width = 100;
            label.height = 100;
            return host;
        });
    };

    public test_SettingTextWhenSizedToContentShouldInvalidate() {
        this.requestLayoutFixture(true, "", label => {
            label.textWrap = false;
            let host = new StackLayout();
            host.orientation = "horizontal";
            return host;
        });
    };

    public test_ChangingTextWhenSizedToContentShouldInvalidate() {
        this.requestLayoutFixture(true, "Hello World", label => {
            label.textWrap = false;
            let host = new StackLayout();
            host.orientation = "horizontal";
            return host;
        });
    };

    public test_SettingTextOnSingleLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldRequestLayout() {
        this.requestLayoutFixture(true, "", label => {
            label.textWrap = false;
            let host = new StackLayout();
            host.width = 100;
            return host;
        });
    }

    public test_ChangingTextOnSingleLineTextWhenWidthIsSizedToParentAndHeightIsSizedToContentShouldNotRequestLayout() {
        this.requestLayoutFixture(false, "Hello World", label => {
            label.textWrap = false;
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
