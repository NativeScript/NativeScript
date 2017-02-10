import * as TKUnit from "../../TKUnit";
import * as application from "application";
import * as buttonModule from "ui/button";
import * as labelModule from "ui/label";
import * as pageModule from "ui/page";
import * as stackModule from "ui/layouts/stack-layout";
import * as wrapModule from "ui/layouts/wrap-layout";
import * as tabViewModule from "ui/tab-view";
import * as helper from "../../ui/helper";
import * as types from "utils/types";
import * as viewModule from "ui/core/view";
import { resolveFileNameFromUrl } from "ui/styling/style-scope";
import { unsetValue } from "ui/core/view";

export function test_css_dataURI_is_applied_to_backgroundImageSource() {
    const stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        page.css = "StackLayout { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC;') }";

        const value = stack.style.backgroundInternal;

        TKUnit.assert(types.isDefined(value), "Style background-image not loaded correctly from data URI.");
        TKUnit.assert(types.isDefined(value.image), "Style background-image not loaded correctly from data URI.");
    });
}

export function test_css_is_applied_to_normal_properties() {
    const stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        const expected = "horizontal";
        page.css = `StackLayout { orientation: ${expected}; }`;
        TKUnit.assertEqual(stack.orientation, expected);
    });
}

export function test_css_is_applied_to_special_properties() {
    const stack = new stackModule.StackLayout();

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        const expected = "test";
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
    const testButton = new buttonModule.Button();
    testButton.text = "Test";
    const stack = new stackModule.StackLayout();
    stack.addChild(testButton);

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

export function test_css_is_applied_inside_TabView() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";
    const tabView = new tabViewModule.TabView();
    let item = new tabViewModule.TabViewItem();
    item.title = "First tab";
    item.view = testButton;
    tabView.items = [item];

    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

export function test_css_is_applied_inside_NestedControls() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";
    const rootLayout = new stackModule.StackLayout();
    const nestedLayout = new stackModule.StackLayout();
    rootLayout.addChild(nestedLayout);
    nestedLayout.addChild(testButton);

    helper.buildUIAndRunTest(rootLayout, function (views: Array<viewModule.View>) {
        const page = <pageModule.Page>views[1];
        page.css = "button { color: red; }";
        helper.assertViewColor(testButton, "#FF0000");
    });
}

// Basic selector tests
export function test_setting_css() {
    // >> article-setting-css-page
    const page = new pageModule.Page();
    page.css = ".title { font-size: 20 }";
    // << article-setting-css-page

    TKUnit.assert(page.css === ".title { font-size: 20 }", "CSS not set correctly.");
}

// Basic selector tests
export function test_type_selector() {
    let page = helper.getClearCurrentPage();

    page.style.color = unsetValue;

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
    let page = helper.getClearCurrentPage();
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

    const stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithClass);
    stack.addChild(btnWithNoClass);

    helper.assertViewColor(btnWithClass, "#FF0000");
    TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value");
}

export function test_multiple_class_selector() {
    let page = helper.getClearCurrentPage();
    let btnWithClasses: buttonModule.Button;

    page.css = ".style1 { color: red; } .style2 { background-color: blue } ";

    //// Will be styled
    btnWithClasses = new buttonModule.Button();
    btnWithClasses.className = "style1 style2";

    const stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithClasses);

    helper.assertViewColor(btnWithClasses, "#FF0000");
    helper.assertViewBackgroundColor(btnWithClasses, "#0000FF");
}

export function test_id_selector() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;
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

    const stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btnWithId);
    stack.addChild(btnWithNoId);

    helper.assertViewColor(btnWithId, "#FF0000");
    TKUnit.assert(btnWithNoId.style.color === undefined, "Color should not have a value");
}

// State selector tests
export function test_state_selector() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;
    let btn: buttonModule.Button;
    const testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn = new buttonModule.Button();
    testStack.addChild(btn);

    page.css = ":pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_type_and_state_selector() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;
    let btn: buttonModule.Button;

    // >>article-using-state-selector
    page.css = "button:pressed { color: red; }";

    //// Will be red when pressed
    btn = new buttonModule.Button();
    // << article-using-state-selector
    const stack = new stackModule.StackLayout();
    page.content = stack;
    stack.addChild(btn);

    testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;

    let btn = new buttonModule.Button();
    btn.className = "test"

    let testStack = new stackModule.StackLayout();
    page.content = testStack;
    testStack.addChild(btn);

    page.css = ".test:pressed { color: red; }";
    testButtonPressedStateIsRed(btn);
}

export function test_class_and_state_selector_with_multiple_classes() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;

    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn.className = "test otherClass"
    testStack.addChild(btn);

    page.css = ".test:pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_id_and_state_selector() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;

    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;

    btn.id = "myButton";
    testStack.addChild(btn);

    page.css = "#myButton:pressed { color: red; }";

    testButtonPressedStateIsRed(btn);
}

export function test_restore_original_values_when_state_is_changed() {
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;

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

export const test_composite_selector_type_and_class = function () {
    // Arrange
    const testStack = new stackModule.StackLayout();

    const btnWithClass = new buttonModule.Button();
    btnWithClass.className = "test";
    testStack.addChild(btnWithClass);

    const btnWithNoClass = new buttonModule.Button();
    testStack.addChild(btnWithNoClass);

    const lblWithClass = new labelModule.Label();
    lblWithClass.className = "test";
    testStack.addChild(lblWithClass);

    let testCss = "button.test { color: red; }";

    let testFunc = function (views: Array<viewModule.View>) {
        TKUnit.assert(btnWithClass.style.color, "Color property no applied correctly.");
        TKUnit.assert(btnWithClass.style.color.hex === "#FF0000", "Color property no applied correctly.");
        TKUnit.assert(btnWithNoClass.style.color === undefined, "btnWithNoClass color should not have a value");
        TKUnit.assert(lblWithClass.style.color === undefined, "lblWithClass color should not have a value");
    }

    helper.buildUIAndRunTest(testStack, testFunc, testCss);
}

export const test_composite_selector_type_class_state = function () {
    const testStack = new stackModule.StackLayout();
    const btnWithClass = new buttonModule.Button();
    btnWithClass.className = "test";
    testStack.addChild(btnWithClass);

    const btnWithNoClass = new buttonModule.Button();
    testStack.addChild(btnWithNoClass);

    const lblWithClass = new labelModule.Label();
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

export const test_style_is_applied_when_control_is_added_after_load = function () {
    let page = helper.getClearCurrentPage();
    let btn = new buttonModule.Button();
    let testStack = new stackModule.StackLayout();
    page.content = testStack;
    page.css = "button { color: red; }";

    testStack.addChild(btn);
    TKUnit.assert(btn.style.color, "Color property no applied correctly.");
    TKUnit.assertEqual(btn.style.color.hex, "#FF0000", "Color property not applied correctly.");
}

const changeIdOrClassTestCss =
    "button { background-color: #111111 } " +
    ".button-class { background-color: #222222 } " +
    ".button-class-two { background-color: #333333 } " +
    "#myButton { background-color: #444444 } " +
    "#myButtonTwo { background-color: #555555 } ";

export function test_styles_are_updated_when_cssClass_is_set() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = "button-class";

        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssClass_is_changed() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    btn.className = "button-class";
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = "button-class-two";

        helper.assertViewBackgroundColor(btn, "#333333");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssClass_is_cleared() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    btn.className = "button-class";
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.className = undefined;

        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_set() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = "myButton";

        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_changed() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    btn.id = "myButton";
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = "myButtonTwo";

        helper.assertViewBackgroundColor(btn, "#555555");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_id_is_cleared() {
    const testStack = new stackModule.StackLayout();
    const btn = new buttonModule.Button();
    btn.id = "myButton";
    const btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    const testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#444444");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.id = undefined;

        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

const typeSelector = "button { color: blue } ";
const classSelector = ".button-class { color: green } ";
const idSelector = "#myButton { color: red } ";

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
    let page = helper.getClearCurrentPage();
    page.style.color = unsetValue;
    let btn: buttonModule.Button;
    let btnWithClass: buttonModule.Button;
    let btnWithId: buttonModule.Button;

    const testStack = new stackModule.StackLayout();
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

export function test_setInlineStyle_setsLocalValues() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";
    const stack = new stackModule.StackLayout();
    stack.addChild(testButton);

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        (<any>testButton)._applyInlineStyle("color: red;");
        helper.assertViewColor(testButton, "#FF0000");
    });
}

export function test_setStyle_throws() {
    const testButton = new buttonModule.Button();

    TKUnit.assertThrows(function () {
        (<any>testButton).style = "background-color: red;";
    }, "View.style property is read-only.");
}

export function test_CSS_isAppliedOnPage() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        const page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "page { background-color: red; }";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        const page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "@import url('~/ui/styling/test.css');";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import_Without_Url() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        const page: pageModule.Page = <pageModule.Page>views[1];
        page.css = "@import '~/ui/styling/test.css';";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_addCssFile() {
    const testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        const page: pageModule.Page = <pageModule.Page>views[1];
        page.addCssFile("~/ui/styling/test.css");
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

const invalidCSS = ".invalid { " +
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
    const testButton = new buttonModule.Button();
    testButton.text = "Test";
    testButton.className = "invalid";

    helper.buildUIAndRunTest(testButton, (views: Array<viewModule.View>) => {
        TKUnit.assertEqual(30, testButton.style.fontSize);
    }, invalidCSS);
}

// Check Mixed, Upper and lower case properties
const casedCSS = ".cased {" +
    "cOlOr: blue; " +
    "FONT-SIZE: 30; " +
    "background-color: red; " +
    "}";

export function test_set_mixed_CSS_cases_works() {
    const testButton = new buttonModule.Button();
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

export function test_UsingSameSelectors_ShouldApplyLatest() {
    let testButton = new buttonModule.Button();
    testButton.className = 'green';

    let testCss = ".green { background-color: #FF0000; } .green { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_UsingSameSelectorsWithSpecific_ShouldApplyLatest() {
    let testButton = new buttonModule.Button();
    testButton.className = 'red green';

    let testCss = ".red { background-color: #FF0000; } Button.green { background-color: #00FF00; }";

    let testFunc = function (views: Array<viewModule.View>) {
        // style from correct type css should be applied
        helper.assertViewBackgroundColor(testButton, "#00FF00");
    }
    helper.buildUIAndRunTest(testButton, testFunc, testCss);
}

export function test_CascadingClassNamesAppliesAfterPageLoad() {
    const stack = new stackModule.StackLayout();
    const label = new labelModule.Label();
    label.text = "Some text";
    label.className = 'lab1';
    stack.addChild(label);

    application.addCss(".added { background-color: red; } .added .lab1 { background-color: blue; } .lab1 { color: red}");

    helper.buildUIAndRunTest(stack, function (views: Array<viewModule.View>) {
        helper.assertViewColor(label, "#FF0000");
        stack.className = "added";
        helper.assertViewBackgroundColor(label, "#0000FF");
        helper.assertViewBackgroundColor(stack, "#FF0000");
    });
}

export function test_resolveFileNameFromUrl_local_file_tilda() {
    const localFileExistsMock = (fileName: string ) => true;
    let url = "~/theme/core.css";
    let appDirectory = "app";
    let expected = `${appDirectory}/theme/core.css`;
    let result = resolveFileNameFromUrl(url, appDirectory, localFileExistsMock);

    TKUnit.assertEqual(result, expected, "Should resolve local file with leading tilda (~/)");
}

export function test_resolveFileNameFromUrl_local_file_no_tilda() {
    const localFileExistsMock = (fileName: string ) => true;
    let url = "theme/core.css";
    let appDirectory = "app";
    let expected = `${appDirectory}/theme/core.css`;
    let result = resolveFileNameFromUrl(url, appDirectory, localFileExistsMock);

    TKUnit.assertEqual(result, expected, "Should resolve local file without leading tilda (no ~/)");
}

export function test_resolveFileNameFromUrl_external_file_tilda() {
    const externalFileExistsMock = (fileName: string) => (fileName.indexOf("tns_modules") !== -1);
    let url = "~/theme/core.css";
    let appDirectory = "app";
    let expected = `${appDirectory}/tns_modules/theme/core.css`;
    let result = resolveFileNameFromUrl(url, appDirectory, externalFileExistsMock);

    TKUnit.assertEqual(result, expected, "Should resolve file from tns_modules with leading tilda (~/)");
}

export function test_resolveFileNameFromUrl_external_file_no_tilda() {
    const externalFileExistsMock = (fileName: string) => (fileName.indexOf("tns_modules") !== -1);
    let url = "theme/core.css";
    let appDirectory = "app";
    let expected = `${appDirectory}/tns_modules/theme/core.css`;
    let result = resolveFileNameFromUrl(url, appDirectory, externalFileExistsMock);

    TKUnit.assertEqual(result, expected, "Should resolve file from tns_modules without leading tilda (no ~/)");
}

export function test_resolveFileNameFromUrl_unexisting_file() {
    const fileDoesNotExistMock = (fileName: string) => false;
    let url = "~/theme/core.css";
    let appDirectory = "app";
    let result = resolveFileNameFromUrl(url, appDirectory, fileDoesNotExistMock);

    TKUnit.assertNull(result, "Shouldn't resolve unexisting file");
}

// <snippet module="ui/styling" title="styling">
// For information and example how to use style properties please refer to special [**Styling**](../../../styling.md) topic.
// </snippet>
