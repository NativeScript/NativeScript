import TKUnit = require("../../TKUnit");
import application = require("application");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import pageModule = require("ui/page");
import stackModule = require("ui/layouts/stack-layout");
import wrapModule = require("ui/layouts/wrap-layout");
import tabViewModule = require("ui/tab-view");
import helper = require("../../ui/helper");
import styling = require("ui/styling");
import types = require("utils/types");
import viewModule = require("ui/core/view");
import styleModule = require("ui/styling/style");
import dependencyObservableModule = require("ui/core/dependency-observable");

export function test_css_dataURI_is_applied_to_backgroundImageSource() {
    var stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        page.css = "StackLayout { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC;') }";

        var value = stack.style._getValue(styleModule.backgroundInternalProperty);

        TKUnit.assert(types.isDefined(value), "Style background-image not loaded correctly from data URI.");
        TKUnit.assert(types.isDefined(value.image), "Style background-image not loaded correctly from data URI.");
    });
}

export function test_css_is_applied_to_normal_properties() {
    var stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        var expected = "horizontal";
        page.css = `StackLayout { orientation: ${expected}; }`;
        TKUnit.assertEqual(stack.orientation, expected);
    });
}

export function test_css_is_applied_to_special_properties() {
    var stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        var expected = "test";
        page.css = `StackLayout { class: ${expected}; }`;
        TKUnit.assertEqual(stack.className, expected);
    });
}

export function test_applies_css_changes_to_application_rules_before_page_load() {
    application.addCss(".applicationChangedLabelBefore { color: red; }");
    const label = new labelModule.Label();
    label.className = "applicationChangedLabelBefore";
    label.text = "Red color coming from updated application rules";

    helper.buildUIAndRunTest(label, function (views: Array<viewModule.View>) {
        helper.assertViewColor(label, "#FF0000");
    });
}

export function test_applies_css_changes_to_application_rules_after_page_load() {
    const label1 = new labelModule.Label();
    label1.text = "Blue color coming from updated application rules";

    helper.buildUIAndRunTest(label1, function (views: Array<viewModule.View>) {
        application.addCss(".applicationChangedLabelAfter { color: blue; }");
        label1.className = "applicationChangedLabelAfter";
        helper.assertViewColor(label1, "#0000FF");
    });
}

export function test_applies_css_changes_to_application_rules_after_page_load_new_views() {
    const host = new stackModule.StackLayout();

    helper.buildUIAndRunTest(host, function (views: Array<viewModule.View>) {
        application.addCss(".applicationChangedLabelAfterNew { color: #00FF00; }");

        const label = new labelModule.Label();
        label.className = "applicationChangedLabelAfterNew";
        label.text = "Blue color coming from updated application rules";
        host.addChild(label);
        helper.assertViewColor(label, "#00FF00");
    });
}

// Test for inheritance in different containers
export function test_css_is_applied_inside_StackLayout() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    var stack = new stackModule.StackLayout();
    stack.addChild(testButton);

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

export function test_css_is_applied_inside_TabView() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    var tabView = new tabViewModule.TabView();
    let item = new tabViewModule.TabViewItem();
    item.title = "First tab";
    item.view = testButton;
    tabView.items = [item];

    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

export function test_css_is_applied_inside_NestedControls() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    var rootLayout = new stackModule.StackLayout();
    var nestedLayout = new stackModule.StackLayout();
    rootLayout.addChild(nestedLayout);
    nestedLayout.addChild(testButton);

    helper.buildUIAndRunTest(rootLayout, function (views: Array<viewModule.View>) {
        var page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

// Basic selector tests
export function test_setting_css() {
    // >> article-setting-css-page
    var page = new pageModule.Page();
    page.css = ".title { font-size: 20 }";
    // << article-setting-css-page

    TKUnit.assert(page.css === ".title { font-size: 20 }", "CSS not set correctly.");
}

// Basic selector tests
export function test_type_selector() {
    let page = helper.getCurrentPage();
    page.color = null;
    let btn: buttonModule.Button;
    let label: labelModule.Label;

    // >> article-using-type-selector
    page.css = "button { background-color: red; }";

    //// Will be styled
    btn = new buttonModule.Button();

    //// Won't be styled
    label = new labelModule.Label();
    // << article-using-type-selector

    let stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(label);
    stack.addChild(btn);

    TKUnit.assert(btn.backgroundColor, "backgroundColor property not applied correctly.");
    TKUnit.assertEqual(btn.backgroundColor.hex, "#FF0000", "backgroundColor");
    TKUnit.assertNull(label.backgroundColor, "backgroundColor should not have a value");
}

export function test_class_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);
    let btnWithClass: buttonModule.Button;
    let btnWithNoClass: buttonModule.Button;

    // >> article-using-class-selector
    page.css = ".test { color: red; }";

    //// Will be styled
    btnWithClass = new buttonModule.Button();
    btnWithClass.className = "test";

    //// Won't be styled
    btnWithNoClass = new buttonModule.Button();
    // << article-using-class-selector

    var stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithClass);
    stack.addChild(btnWithNoClass);

    helper.assertViewColor(btnWithClass, "#FF0000");
    TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value");
}

export function test_multiple_class_selector() {
    let page = helper.getCurrentPage();
    let btnWithClasses: buttonModule.Button;

    page.css = ".style1 { color: red; } .style2 { background-color: blue } ";

    //// Will be styled
    btnWithClasses = new buttonModule.Button();
    btnWithClasses.className = "style1 style2";

    var stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithClasses);

    helper.assertViewColor(btnWithClasses, "#FF0000");
    helper.assertViewBackgroundColor(btnWithClasses, "#0000FF");
}

export function test_id_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);
    let btnWithId: buttonModule.Button;
    let btnWithNoId: buttonModule.Button;

    // >> article-using-id-selector
    page.css = "#myButton { color: red; }";

    //// Will be styled
    btnWithId = new buttonModule.Button();
    btnWithId.id = "myButton";

    //// Won't be styled
    btnWithNoId = new buttonModule.Button();
    // << article-using-id-selector

    var stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithId);
    stack.addChild(btnWithNoId);

    helper.assertViewColor(btnWithId, "#FF0000");
    TKUnit.assert(btnWithNoId.style.color === undefined, "Color should not have a value");
}

// State selector tests
export function test_state_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);
    let btn: buttonModule.Button;
    var testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn = new buttonModule.Button();
    testStack.addChild(btn);

    page.css = ":pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_type_and_state_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);
    var btn: buttonModule.Button;

    // >>article-using-state-selector
    page.css = "button:pressed { color: red; }";

    //// Will be red when pressed
    btn = new buttonModule.Button();
    // << article-using-state-selector
    var stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btn);

    testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);

    let btn = new buttonModule.Button();
    btn.className = "test"

    let testStack = new stackModule.StackLayout();
    page.content = testStack;
    testStack.addChild(btn);

    page.css = ".test:pressed { color: red; }";
    testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector_with_multiple_classes() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);

    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn.className = "test otherClass"
    testStack.addChild(btn);

    page.css = ".test:pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_id_and_state_selector() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);

    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn.id = "myButton";
    testStack.addChild(btn);

    page.css = "#myButton:pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_restore_original_values_when_state_is_changed() {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);

    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;
    testStack.addChild(btn);

    page.css = "button { color: blue; } " +
        "button:pressed { color: red; } ";

    helper.assertViewColor(btn, "#0000FF");
    btn._goToVisualState("pressed");
    helper.assertViewColor(btn, "#FF0000");
    btn._goToVisualState("normal");
    helper.assertViewColor(btn, "#0000FF");
}

export var test_composite_selector_type_and_class = function () {
    // Arrange
    var testStack = new stackModule.StackLayout();

    var btnWithClass = new buttonModule.Button();
    btnWithClass.className = "test";
    testStack.addChild(btnWithClass);

    var btnWithNoClass = new buttonModule.Button();
    testStack.addChild(btnWithNoClass);

    var lblWithClass = new labelModule.Label();
    lblWithClass.className = "test";
    testStack.addChild(lblWithClass);

    let testCss = "button.test { color: red; }";

    let testFunc = function (views: Array<viewModule.View>) {
        TKUnit.assert(btnWithClass.style.color, "Color property no applied correctly.");
        TKUnit.assert(btnWithClass.style.color.hex === "#FF0000", "Color property no applied correctly.");

        TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value");

        TKUnit.assert(lblWithClass.style.color === undefined, "Color should not have a value");
    }

    helper.buildUIAndRunTest(testStack, testFunc, testCss);
}

export var test_composite_selector_type_class_state = function () {
    var testStack = new stackModule.StackLayout();
    var btnWithClass = new buttonModule.Button();
    btnWithClass.className = "test";
    testStack.addChild(btnWithClass);

    var btnWithNoClass = new buttonModule.Button();
    testStack.addChild(btnWithNoClass);

    var lblWithClass = new labelModule.Label();
    lblWithClass.className = "test";
    testStack.addChild(lblWithClass);

    let testCss = "button.test:pressed { color: red; }";

    let testFunc = function (views: Array<viewModule.View>) {
        testButtonPressedStateIsRed(btnWithClass);

        // The button with no class should not react to state changes.
        TKUnit.assertNull(btnWithNoClass.style.color, "Color should not have a value.");
        btnWithNoClass._goToVisualState("pressed");
        TKUnit.assertNull(btnWithNoClass.style.color, "Color should not have a value.");
        btnWithNoClass._goToVisualState("normal");
        TKUnit.assertNull(btnWithNoClass.style.color, "Color should not have a value.");

        TKUnit.assertNull(lblWithClass.style.color, "Color should not have a value");
    }
    helper.buildUIAndRunTest(testStack, testFunc, testCss);
}

export var test_style_is_applied_when_control_is_added_after_load = function () {
    let page = helper.getCurrentPage();
    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;
    page.css = "button { color: red; }";

    testStack.addChild(btn);
    TKUnit.assert(btn.style.color, "Color property no applied correctly.");
    TKUnit.assertEqual(btn.style.color.hex, "#FF0000", "Color property not applied correctly.");
}

var changeIdOrClassTestCss =
    "button { background-color: #111111 } " +
    ".button-class { background-color: #222222 } " +
    ".button-class-two { background-color: #333333 } " +
    "#myButton { background-color: #444444 } " +
    "#myButtonTwo { background-color: #555555 } ";

export function test_styles_are_updated_when_cssClass_is_set() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = "button-class";

        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssClass_is_changed() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.className = "button-class";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = "button-class-two";

        helper.assertViewBackgroundColor(btn, "#333333");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssClass_is_cleared() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.className = "button-class";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = undefined;

        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_set() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = "myButton";

        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_changed() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.id = "myButton";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = "myButtonTwo";

        helper.assertViewBackgroundColor(btn, "#555555");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_cleared() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.id = "myButton";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = undefined;

        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

var typeSelector = "button { color: blue } ";
var classSelector = ".button-class { color: green } ";
var idSelector = "#myButton { color: red } ";

export function test_selector_priorities_1() {
    testSelectorsPrioritiesTemplate(typeSelector + classSelector + idSelector);
}

export function test_selector_priorities_2() {
    testSelectorsPrioritiesTemplate(typeSelector + idSelector + classSelector);
}

export function test_selector_priorities_3() {
    testSelectorsPrioritiesTemplate(classSelector + typeSelector + idSelector);
}

export function test_selector_priorities_4() {
    testSelectorsPrioritiesTemplate(classSelector + idSelector + typeSelector);
}

export function test_selector_priorities_5() {
    testSelectorsPrioritiesTemplate(idSelector + typeSelector + classSelector);
}

export function test_selector_priorities_6() {
    testSelectorsPrioritiesTemplate(idSelector + classSelector + typeSelector);
}

function testSelectorsPrioritiesTemplate(css: string) {
    let page = helper.getCurrentPage();
    page.style._resetValue(styling.properties.colorProperty);
    let btn: buttonModule.Button;
    let btnWithClass: buttonModule.Button;
    let btnWithId: buttonModule.Button;

    var testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn = new buttonModule.Button();
    testStack.addChild(btn);

    btnWithClass = new buttonModule.Button();
    btnWithClass.className = "button-class";
    testStack.addChild(btnWithClass);

    btnWithId = new buttonModule.Button();
    btnWithId.className = "button-class";
    btnWithId.id = "myButton"
    testStack.addChild(btnWithId);

    page.css = css;

    helper.assertViewColor(btn, "#0000FF");            //red
    helper.assertViewColor(btnWithClass, "#008000");   //green
    helper.assertViewColor(btnWithId, "#FF0000");      //blue
}

// helpers
function testButtonPressedStateIsRed(btn: buttonModule.Button) {
    TKUnit.assert(btn.style.color === undefined, "Color should not have a value.");

    btn._goToVisualState("pressed");

    helper.assertViewColor(btn, "#FF0000");

    btn._goToVisualState("normal");

    TKUnit.assert(btn.style.color === undefined, "Color should not have a value after returned to normal state.");
}

export function test_styling_converters_are_defined() {
    TKUnit.assert(types.isDefined(styling.converters), "converters module is not defined");
    TKUnit.assert(types.isFunction(styling.converters.colorConverter), "colorConverter function is not defined");
    TKUnit.assert(types.isFunction(styling.converters.fontSizeConverter), "fontSizeConverter function is not defined");
    TKUnit.assert(types.isFunction(styling.converters.textAlignConverter), "textAlignConverter function is not defined");
}

export function test_styling_properties_are_defined() {
    TKUnit.assert(types.isDefined(styling.properties), "properties module is not defined");
    TKUnit.assert(types.isDefined(styling.properties.backgroundColorProperty), "backgroundColorProperty property is not defined");
    TKUnit.assert(types.isDefined(styling.properties.colorProperty), "colorProperty property is not defined");
    TKUnit.assert(types.isDefined(styling.properties.fontSizeProperty), "fontSizeProperty property is not defined");
    TKUnit.assert(types.isDefined(styling.properties.textAlignmentProperty), "textAlignmentProperty property is not defined");

    TKUnit.assert(types.isFunction(styling.properties.eachInheritableProperty), "properties.eachInheritableProperty function is not defined");
    TKUnit.assert(types.isFunction(styling.properties.eachProperty), "properties.eachProperty function is not defined");
    TKUnit.assert(types.isFunction(styling.properties.getPropertyByCssName), "properties.getPropertyByCssName function is not defined");
    TKUnit.assert(types.isFunction(styling.properties.getPropertyByName), "properties.getPropertyByName function is not defined");
}

export function test_styling_visualStates_are_defined() {
    TKUnit.assert(types.isDefined(styling.visualStates), "visualStates module is not defined");
    TKUnit.assert(types.isString(styling.visualStates.Hovered), "Hovered state is not defined");
    TKUnit.assert(types.isString(styling.visualStates.Normal), "Normal state is not defined");
    TKUnit.assert(types.isString(styling.visualStates.Pressed), "Pressed state is not defined");
}

export function test_styling_stylers_are_defined() {
    TKUnit.assert(types.isFunction(styleModule.registerHandler), "registerHandler function is not defined");
    TKUnit.assert(types.isFunction(styleModule.StylePropertyChangedHandler), "StylePropertyChangedHandler class is not defined");
}

export function test_styling_classes_are_defined() {
    TKUnit.assert(types.isFunction(styling.Style), "Style class is not defined");
    TKUnit.assert(types.isFunction(styling.Property), "Property class is not defined");
}

export function test_setInlineStyle_setsLocalValues() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    var stack = new stackModule.StackLayout();
    stack.addChild(testButton);

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        (<any>testButton)._applyInlineStyle("color: red;");
        helper.assertViewColor(testButton, "#FF0000", dependencyObservableModule.ValueSource.Local);
    });
}

export function test_setStyle_throws() {
    var testButton = new buttonModule.Button();

    TKUnit.assertThrows(function () {
        (<any>testButton).style = "background-color: red;";
    }, "View.style property is read-only.");
}

export function test_CSS_isAppliedOnPage() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "page { background-color: red; }";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "@import url('~/ui/style/test.css');";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import_Without_Url() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "@import '~/ui/style/test.css';";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_addCssFile() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page>views[1];
        page.addCssFile("~/ui/style/test.css");
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

var invalidCSS = ".invalid { " +
    "color: invalidValue; " +
    "background-color: invalidValue; " +
    "border-color: invalidValue; " +
    "border-width: invalidValue; " +
    "border-radius: invalidValue; " +
    "font: invalidValue; " +
    "font-style: invalidValue; " +
    "font-weight: invalidValue; " +
    "text-align: invalidValue; " +
    "min-width: invalidValue; " +
    "min-height: invalidValue; " +
    "visibility: invalidValue; " +
    "opacity: invalidValue; " +
    "font-size: 30;" + // set one valid value to test it is applied
    "}";

export function test_set_invalid_CSS_values_dont_cause_crash() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    testButton.className = "invalid";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(30, testButton.style.fontSize);
    }, invalidCSS);
}

// Check Mixed, Upper and lower case properties
var casedCSS = ".cased {" +
    "cOlOr: blue; " +
    "FONT-SIZE: 30; " +
    "background-color: red; " +
    "}";

export function test_set_mixed_CSS_cases_works() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";
    testButton.className = "cased";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(30, testButton.style.fontSize);
        helper.assertViewBackgroundColor(testButton, "#FF0000");
        helper.assertViewColor(testButton, "#0000FF");
    }, casedCSS);
}

export function test_basic_hierarchical_selectors() {
    let stack = new stackModule.StackLayout();
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "stacklayout button { background-color: #FF0000; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#FF0000");
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#FF0000");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_basic_hierarchical_direct_child_selectors() {
    let stack = new stackModule.StackLayout();
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "stacklayout > button { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#FF0000");
        // only buttons that are direct children of StackLayout should have red background color
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#00FF00");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_basic_hierarchical_direct_child_more_levels_selectors() {
    let stack = new stackModule.StackLayout();
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "stacklayout > wraplayout > button { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#00FF00");
        // only buttons that are direct children of StackLayout and WrapLayout should have red background color
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#FF0000");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types() {
    let stack = new stackModule.StackLayout();
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    wrap.className = "wraplayoutClass";
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";
    testButton2.className = "buttonClass";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "stacklayout>.wraplayoutClass > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#00FF00");
        // only buttons that are direct children of StackLayout and WrapLayout should have red background color
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#FF0000");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types2() {
    let stack = new stackModule.StackLayout();
    stack.id = "stack";
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    wrap.className = "wraplayoutClass";
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";
    testButton2.className = "buttonClass";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "#stack>.wraplayoutClass>.buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#00FF00");
        // only buttons that are direct children of Layout with id stack and Layout with cssClass wraplayoutClass should have red background color
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#FF0000");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types_invalid() {
    let stack = new stackModule.StackLayout();
    stack.id = "stack";
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    wrap.className = "wraplayoutClass";
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";
    testButton2.className = "buttonClass";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "#stackErr > .wraplayoutClass > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#00FF00");
        // this is an invalid css so red style should not be applied
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#00FF00");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_hierarchical_direct_child_more_levels_diff_selector_types_invalid_middle() {
    let stack = new stackModule.StackLayout();
    stack.id = "stack";
    let testButton1 = new buttonModule.Button();
    testButton1.text = "Test 1";
    testButton1.id = "testButton1";

    let wrap = new wrapModule.WrapLayout();
    wrap.className = "wraplayoutClass";
    let testButton2 = new buttonModule.Button();
    testButton2.text = "Test 2";
    testButton2.id = "testButton2";
    testButton2.className = "buttonClass";

    wrap.addChild(testButton2);
    stack.addChild(testButton1);
    stack.addChild(wrap);

    let testCss = "#stack > .wraplayoutClassErr > .buttonClass { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(stack.getViewById("testButton1"), "#00FF00");
        // this is an invalid css so red style should not be applied
        helper.assertViewBackgroundColor(stack.getViewById("testButton2"), "#00FF00");
    }

    helper.buildUIAndRunTest(stack, testFunc, testCss);
}

export function test_type_attr_selector() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "some value";

    let testCss = "button[testAttr] { background-color: #FF0000; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_class_attr_selector() {
    let testButton = new buttonModule.Button();
    testButton.className = "button";
    testButton["testAttr"] = "some value";

    let testCss = ".button[testAttr] { background-color: #FF0000; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_id_attr_selector() {
    let testButton = new buttonModule.Button();
    testButton.id = "myButton";
    testButton["testAttr"] = "some value";

    let testCss = "#myButton[testAttr] { background-color: #FF0000; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_type_attr_value_selector() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "somevalue";

    let testCss = "button[testAttr='somevalue'] { background-color: #FF0000; }";

    let testFunc = function (views: Array<viewModule.View>) {
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_type_attr_invalid_value_selector() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "somevalue";

    let testCss = "button[testAttr='value'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_correct_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_correct_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "some flower";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_correct_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower new";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_incorrect_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "my-flower";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_incorrect_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowers";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_tilde_attr_selector_incorrect_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower-house";

    let testCss = "button[testAttr~='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_pipe_attr_selector_correct_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_pipe_attr_selector_correct_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower-house";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_pipe_attr_selector_incorrect_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowers";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_pipe_attr_selector_incorrect_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "myflower";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_pipe_attr_selector_incorrect_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "my-flower";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_power_attr_selector_correct_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower";

    let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_power_attr_selector_correct_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower-house";

    let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_power_attr_selector_correct_synta2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowers";

    let testCss = "button[testAttr^='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_power_attr_selector_incorrect_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "myflower";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_power_attr_selector_incorrect_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "my-flower";

    let testCss = "button[testAttr|='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_correct_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_correct_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "myflower";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_correct_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "my-flower";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_incorrect_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowers";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_incorrect_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowermy";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_dollar_attr_selector_incorrect_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower-my";

    let testCss = "button[testAttr$='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax1() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "myflower";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax2() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "my-flower";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax3() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowers";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax4() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flowermy";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_correct_syntax5() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flower-my";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } ";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#FF0000");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_star_attr_selector_incorrect_syntax() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flow";

    let testCss = "button[testAttr*='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_alone_attr_selector() {
    let testButton = new buttonModule.Button();
    testButton["testAttr"] = "flow";
    
    let testCss = "[testAttr*='flower'] { background-color: #FF0000; } button { background-color: #00FF00; }";
    
    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}
// <snippet module="ui/styling" title="styling">
// For information and example how to use style properties please refer to special [**Styling**](../../../styling.md) topic. 
// </snippet>
