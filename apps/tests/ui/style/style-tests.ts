import TKUnit = require("../../TKUnit");
import buttonModule = require("ui/button");
import labelModule = require("ui/label");
import pageModule = require("ui/page");
import stackModule = require("ui/layouts/stack-layout");
import tabViewModule = require("ui/tab-view");
import helper = require("../../ui/helper");
import styling = require("ui/styling");
import types = require("utils/types");
import viewModule = require("ui/core/view");
import styleModule = require("ui/styling/style");
import dependencyObservableModule = require("ui/core/dependency-observable");

// <snippet module="ui/styling" title="styling">
// # Styling
// </snippet>

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
    tabView.items = [new tabViewModule.TabViewItem({ title: "First tab", view: testButton })];

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
    // <snippet module="ui/styling" title="styling">
    // ### Setting CSS to a page
    // ``` JavaScript
    var page = new pageModule.Page();
    page.css = ".title { font-size: 20 }";
    // ```
    // </snippet>

    TKUnit.assert(page.css === ".title { font-size: 20 }", "CSS not set correctly.");
}

// <snippet module="ui/styling" title="styling">
// ## Using CSS selectors
// </snippet>

// Basic selector tests
export function test_type_selector() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var label: labelModule.Label;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();

        // <snippet module="ui/styling" title="styling">
        // ### Using type selector
        // ``` JavaScript
        page.css = "button { color: red; }";

        //// Will be styled
        btn = new buttonModule.Button();

        //// Won't be styled
        label = new labelModule.Label();
        // ```
        // </snippet>

        var stack = new stackModule.StackLayout();
        page.content = stack;
        stack.addChild(label);
        stack.addChild(btn);
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#FF0000");
    TKUnit.assert(label.style.color === undefined, "Color should not have a value");

    helper.goBack();
}

export function test_class_selector() {
    var page: pageModule.Page;
    var btnWithClass: buttonModule.Button;
    var btnWithNoClass: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();

        // <snippet module="ui/styling" title="styling">
        // ### Using class selector
        // ``` JavaScript
        page.css = ".test { color: red; }";

        //// Will be styled
        btnWithClass = new buttonModule.Button();
        btnWithClass.cssClass = "test";

        //// Won't be styled
        btnWithNoClass = new buttonModule.Button();
        // ```
        // </snippet>

        var stack = new stackModule.StackLayout();
        page.content = stack;
        stack.addChild(btnWithClass);
        stack.addChild(btnWithNoClass);
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btnWithClass, "#FF0000");
    TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value");

    helper.goBack();
}

export function test_multiple_class_selector() {
    var page: pageModule.Page;
    var btnWithClasses: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();

        page.css = ".style1 { color: red; } .style2 { background-color: blue } ";

        //// Will be styled
        btnWithClasses = new buttonModule.Button();
        btnWithClasses.cssClass = "style1 style2";

        var stack = new stackModule.StackLayout();
        page.content = stack;
        stack.addChild(btnWithClasses);
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btnWithClasses, "#FF0000");
    helper.assertViewBackgroundColor(btnWithClasses, "#0000FF");

    helper.goBack();
}

export function test_id_selector() {
    var page: pageModule.Page;
    var btnWithId: buttonModule.Button;
    var btnWithNoId: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();

        // <snippet module="ui/styling" title="styling">
        // ### Using id selector
        // ``` JavaScript
        page.css = "#myButton { color: red; }";

        //// Will be styled
        btnWithId = new buttonModule.Button();
        btnWithId.id = "myButton";

        //// Won't be styled
        btnWithNoId = new buttonModule.Button();
        // ```
        // </snippet>

        var stack = new stackModule.StackLayout();
        page.content = stack;
        stack.addChild(btnWithId);
        stack.addChild(btnWithNoId);
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btnWithId, "#FF0000");
    TKUnit.assert(btnWithNoId.style.color === undefined, "Color should not have a value");

    helper.goBack();
}

// State selector tests
export function test_state_selector() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        // Arrange
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        testStack.addChild(btn);

        page.css = ":pressed { color: red; }";
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    testButtonPressedStateIsRed(btn);

    helper.goBack();
}

export function test_type_and_state_selector() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();

        // <snippet module="ui/styling" title="styling">
        // ### Using state selector
        // ``` JavaScript
        page.css = "button:pressed { color: red; }";

        //// Will be red when pressed
        btn = new buttonModule.Button();
        // ```
        // </snippet>
        var stack = new stackModule.StackLayout();
        page.content = stack;
        stack.addChild(btn);
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    testButtonPressedStateIsRed(btn);

    helper.goBack();
}

export function test_class_and_state_selector() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        // Arrange
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        btn.cssClass = "test"
        testStack.addChild(btn);

        page.css = ".test:pressed { color: red; }";
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    testButtonPressedStateIsRed(btn);

    helper.goBack();
}

export function test_class_and_state_selector_with_multiple_classes() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        // Arrange
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        btn.cssClass = "test otherClass"
        testStack.addChild(btn);

        page.css = ".test:pressed { color: red; }";
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    testButtonPressedStateIsRed(btn);

    helper.goBack();
}

export function test_id_and_state_selector() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        // Arrange
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        btn.id = "myButton";
        testStack.addChild(btn);

        page.css = "#myButton:pressed { color: red; }";
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    testButtonPressedStateIsRed(btn);

    helper.goBack();
}

export function test_restore_original_values_when_state_is_changed() {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        // Arrange
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        testStack.addChild(btn);

        page.css = "button { color: blue; } " +
        "button:pressed { color: red; } ";
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#0000FF");
    btn._goToVisualState("pressed");
    helper.assertViewColor(btn, "#FF0000");
    btn._goToVisualState("normal");
    helper.assertViewColor(btn, "#0000FF");

    helper.goBack();
}

// TODO: Complex composite selectors are not supported yet
//export var test_composite_selector_type_and_class = function () {
//    // Arrange
//    var testPage = new page.Page();
//    var testStack = new stack.StackLayout();
//    testPage.content = testStack;

//    var btnWithClass = new button.Button();
//    btnWithClass.cssClass = "test";
//    testStack.addChild(btnWithClass);

//    var btnWithNoClass = new button.Button();
//    testStack.addChild(btnWithNoClass);

//    var lblWithClass = new label.Label();
//    lblWithClass.cssClass = "test";
//    testStack.addChild(lblWithClass);

//    testPage.css = "button.test { color: red; }";

//    // Act & Assert
//    var finished = false;
//    testPage.onNavigatedTo = function (context) {
//        TKUnit.assert(btnWithClass.style.color, "Color property no applied correctly.");
//        TKUnit.assert(btnWithClass.style.color.hex === "#FF0000", "Color property no applied correctly.");

//        TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value");

//        TKUnit.assert(lblWithClass.style.color === undefined, "Color should not have a value");

//        finished = true;
//    };
//    frame.topmost().navigate(testPage);

//    TKUnit.waitUntilReady(function () {
//        return finished;
//    }, 3);
//}

// TODO: Complex composite selectors are not supported yet
//export var test_composite_selector_type_class_state = function () {
//    // Arrange
//    var testPage = new page.Page();
//    var testStack = new stack.StackLayout();
//    testPage.content = testStack;

//    var btnWithClass = new button.Button();
//    btnWithClass.cssClass = "test";
//    testStack.addChild(btnWithClass);

//    var btnWithNoClass = new button.Button();
//    testStack.addChild(btnWithNoClass);

//    var lblWithClass = new label.Label();
//    lblWithClass.cssClass = "test";
//    testStack.addChild(lblWithClass);

//    testPage.css = "button.test:pressed { color: red; }";

//    // Act & Assert
//    var finished = false;
//    testPage.onNavigatedTo = function (context) {
//        testButtonPressedStateIsRed(btnWithClass);

//        // The button with no class should not react to state changes.
//        TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value.");
//        btnWithNoClass._goToVisualState("pressed");
//        TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value.");
//        btnWithNoClass._goToVisualState("normal");
//        TKUnit.assert(btnWithNoClass.style.color === undefined, "Color should not have a value.");

//        TKUnit.assert(lblWithClass.style.color === undefined, "Color should not have a value");

//        finished = true;
//    };
//    frame.topmost().navigate(testPage);

//    TKUnit.waitUntilReady(function () {
//        return finished;
//    }, 3);
//}

export var test_style_is_applied_when_control_is_added_after_load = function () {
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var testStack: stackModule.StackLayout;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();
        testStack = new stackModule.StackLayout();
        page.content = testStack;
        page.css = "button { color: red; }";
        btn = new buttonModule.Button();
        return page;
    };

    helper.navigate(pageFactory);

    testStack.addChild(btn);
    TKUnit.assert(btn.style.color, "Color property no applied correctly.");
    TKUnit.assert(btn.style.color.hex === "#FF0000", "Color property no applied correctly.");

    helper.goBack();
}

var changeIdOrClassTestCss =
    "button { background-color: #111111 } " +
    ".button-class { background-color: #222222 } " +
    ".button-class-two { background-color: #333333 } " +
    "#myButton { background-color: #444444 } " +
    "#myButtonTwo { background-color: #555555 } ";

export function test_styles_are_updated_when_cssCalss_is_set() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#111111");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.cssClass = "button-class";

        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssCalss_is_changed() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.cssClass = "button-class";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.cssClass = "button-class-two";

        helper.assertViewBackgroundColor(btn, "#333333");
        helper.assertViewBackgroundColor(btn2, "#111111");
    };

    helper.buildUIAndRunTest(testStack, testFunc, changeIdOrClassTestCss);
}

export function test_styles_are_updated_when_cssCalss_is_cleared() {
    var testStack = new stackModule.StackLayout();
    var btn = new buttonModule.Button();
    btn.cssClass = "button-class";
    var btn2 = new buttonModule.Button();
    testStack.addChild(btn);
    testStack.addChild(btn2);

    var testFunc = () => {
        helper.assertViewBackgroundColor(btn, "#222222");
        helper.assertViewBackgroundColor(btn2, "#111111");

        btn.cssClass = undefined;

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
    var page: pageModule.Page;
    var btn: buttonModule.Button;
    var btnWithClass: buttonModule.Button;
    var btnWithId: buttonModule.Button;
    var pageFactory = function (): pageModule.Page {
        page = new pageModule.Page();
        var testStack = new stackModule.StackLayout();
        page.content = testStack;

        btn = new buttonModule.Button();
        testStack.addChild(btn);

        btnWithClass = new buttonModule.Button();
        btnWithClass.cssClass = "button-class";
        testStack.addChild(btnWithClass);

        btnWithId = new buttonModule.Button();
        btnWithId.cssClass = "button-class";
        btnWithId.id = "myButton"
        testStack.addChild(btnWithId);

        page.css = css;
        return page;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#0000FF");            //red
    helper.assertViewColor(btnWithClass, "#008000");   //green
    helper.assertViewColor(btnWithId, "#FF0000");      //blue

    helper.goBack();
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
    TKUnit.assert(types.isFunction(styling.stylers.registerHandler), "registerHandler function is not defined");
    TKUnit.assert(types.isFunction(styling.stylers.StylePropertyChangedHandler), "StylePropertyChangedHandler class is not defined");
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
        var page: pageModule.Page = <pageModule.Page> views[1];
        page.css = "page { background-color: red; }";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page> views[1];
        page.css = "@import url('~/ui/style/test.css');";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_Import_Without_Url() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page> views[1];
        page.css = "@import '~/ui/style/test.css';";
        helper.assertViewBackgroundColor(page, "#FF0000");
    });
}

export function test_CSS_isAppliedOnPage_From_addCssFile() {
    var testButton = new buttonModule.Button();
    testButton.text = "Test";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        var page: pageModule.Page = <pageModule.Page> views[1];
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
    testButton.cssClass = "invalid";

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
    testButton.cssClass = "cased";

    helper.buildUIAndRunTest(testButton, function (views: Array<viewModule.View>) {
        TKUnit.assertEqual(30, testButton.style.fontSize);
        helper.assertViewBackgroundColor(testButton, "#FF0000");
        helper.assertViewColor(testButton, "#0000FF");
    }, casedCSS);
}

// <snippet module="ui/styling" title="styling">
// For information and example how to use style properties please refer to special [**Styling**](../../../styling.md) topic. 
// </snippet>
