import color = require("color");
import button = require("ui/button");
import page = require("ui/page");
import stack = require("ui/layouts/stack-layout");
import helper = require("../helper");

export var test_value_Inherited_stronger_than_Default = function () {
    var testPage: page.Page;
    var btn: button.Button;
    var pageFactory = function (): page.Page {
        testPage = new page.Page();
        var testStack = new stack.StackLayout();
        testPage.content = testStack;

        btn = new button.Button();
        testStack.addChild(btn);
        testPage.css = "stackLayout { color: red; }";
        return testPage;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#FF0000");

    helper.goBack();
}

export var test_value_Css_stronger_than_Inherited = function () {
    var testPage: page.Page;
    var btn: button.Button;
    var pageFactory = function (): page.Page {
        testPage = new page.Page();
        var testStack = new stack.StackLayout();
        testPage.content = testStack;

        btn = new button.Button();
        testStack.addChild(btn);
        testPage.css = "stackLayout { color: red; } button { color: blue; }";
        return testPage;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#0000FF");

    helper.goBack();
}

export var test_value_Local_stronger_than_Css = function () {
    var testPage: page.Page;
    var btn: button.Button;
    var pageFactory = function (): page.Page {
        testPage = new page.Page();
        var testStack = new stack.StackLayout();
        testPage.content = testStack;

        btn = new button.Button();
        testStack.addChild(btn);
        testPage.css = "button { color: red; }";
        return testPage;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#FF0000");
    btn.style.color = new color.Color("#0000FF");
    helper.assertViewColor(btn, "#0000FF");
    btn.style.color = undefined;
    helper.assertViewColor(btn, "#FF0000");

    helper.goBack();
}

export var test_value_VisualState_stronger_than_Local = function () {
    var testPage: page.Page;
    var btn: button.Button;
    var pageFactory = function (): page.Page {
        testPage = new page.Page();
        var testStack = new stack.StackLayout();
        testPage.content = testStack;

        btn = new button.Button();
        btn.style.color = new color.Color("#FF0000");
        testStack.addChild(btn);
        testPage.css = "button:pressed { color: #0000FF; }";
        return testPage;
    };

    // Act & Assert
    helper.navigate(pageFactory);

    helper.assertViewColor(btn, "#FF0000");
    btn._goToVisualState("pressed");
    helper.assertViewColor(btn, "#0000FF");
    btn._goToVisualState("normal");
    helper.assertViewColor(btn, "#FF0000");

    helper.goBack();
}